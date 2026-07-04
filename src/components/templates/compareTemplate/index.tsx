'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { GitCompare, Trash2 } from 'lucide-react'

import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { PageContainer } from '@/components/atoms/pageContainer'
import { Typography } from '@/components/atoms/typography'
import CompareTable from '@/components/organisms/compareTable'
import EmptyCompareState from '@/components/organisms/emptyCompareState'
import { useCompareStore } from '@/store/compare/useCompareStore'
import { ListingService } from '@/api/services/listing.service'

/**
 * CompareTemplate
 * Clean template component for compare page
 * Handles state and layout
 */
const CompareTemplate: React.FC = () => {
  const t = useTranslations('compare')
  const { compareList, clearCompare, removeFromCompare } = useCompareStore()
  const [isMounted, setIsMounted] = useState(false)
  const [unavailableTitles, setUnavailableTitles] = useState<string[]>([])
  const hasCheckedAvailability = useRef(false)

  // Handle hydration: Wait for Zustand store to hydrate from localStorage
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Re-validate compare list against the live listing endpoint once, after hydration.
  // The compare table renders from sessionStorage, which goes stale once a listing
  // expires, gets rejected/suspended, or is deleted — the API 404s all of those
  // identically (see ListingController), so "no data back" is the single signal
  // that a listing is no longer comparable.
  useEffect(() => {
    if (
      !isMounted ||
      hasCheckedAvailability.current ||
      compareList.length === 0
    ) {
      return
    }
    hasCheckedAvailability.current = true

    const checkListingsAvailability = async () => {
      const responses = await Promise.all(
        compareList.map((listing) => ListingService.getById(listing.listingId)),
      )

      const unavailable: string[] = []
      responses.forEach((response, index) => {
        const listing = compareList[index]
        const isUnavailable = !response.success || !response.data

        if (isUnavailable) {
          unavailable.push(listing.title)
          removeFromCompare(listing.listingId)
        }
      })

      if (unavailable.length > 0) {
        setUnavailableTitles(unavailable)
      }
    }

    checkListingsAvailability()
  }, [isMounted, compareList, removeFromCompare])

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <PageContainer width='grid' className='py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-muted rounded w-48 mb-4' />
          <div className='h-64 bg-muted rounded' />
        </div>
      </PageContainer>
    )
  }

  const hasItems = compareList.length > 0

  return (
    <PageContainer width='grid' className='py-6 sm:py-8'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-section'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Typography variant='pageTitle'>{t('title')}</Typography>
            {hasItems && (
              <Badge variant='secondary' className='gap-1.5'>
                <GitCompare className='h-3.5 w-3.5' />
                {t('floatingBar.items', { count: compareList.length })}
              </Badge>
            )}
          </div>
          <Typography variant='p' className='text-muted-foreground mt-1'>
            {t('subtitle')}
          </Typography>
        </div>

        {hasItems && (
          <Button
            variant='outline'
            onClick={clearCompare}
            className='gap-2 shrink-0 self-start sm:self-auto'
          >
            <Trash2 className='w-4 h-4' />
            {t('actions.clearAll')}
          </Button>
        )}
      </div>

      {hasItems ? (
        <CompareTable listings={compareList} />
      ) : (
        <EmptyCompareState />
      )}

      <Dialog
        open={unavailableTitles.length > 0}
        onOpenChange={(open) => {
          if (!open) setUnavailableTitles([])
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('unavailableDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('unavailableDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <ul className='list-disc pl-5 space-y-1'>
            {unavailableTitles.map((title) => (
              <li key={title} className='text-sm text-foreground'>
                {title}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button onClick={() => setUnavailableTitles([])}>
              {t('unavailableDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default CompareTemplate
