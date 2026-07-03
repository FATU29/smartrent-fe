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
import { POST_STATUS } from '@/api/types/property.type'

/**
 * CompareTemplate
 * Clean template component for compare page
 * Handles state and layout
 */
const CompareTemplate: React.FC = () => {
  const t = useTranslations('compare')
  const { compareList, clearCompare, removeFromCompare } = useCompareStore()
  const [isMounted, setIsMounted] = useState(false)
  const [expiredTitles, setExpiredTitles] = useState<string[]>([])
  const hasCheckedExpiry = useRef(false)

  // Handle hydration: Wait for Zustand store to hydrate from localStorage
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Re-validate compare list against live listing status once, after hydration.
  // Expired listings are silently stale in sessionStorage until we check.
  useEffect(() => {
    if (!isMounted || hasCheckedExpiry.current || compareList.length === 0) {
      return
    }
    hasCheckedExpiry.current = true

    const checkExpiredListings = async () => {
      const responses = await Promise.all(
        compareList.map((listing) => ListingService.getById(listing.listingId)),
      )

      const expired: string[] = []
      responses.forEach((response, index) => {
        const listing = compareList[index]
        const isExpired =
          response.data?.expired === true ||
          response.data?.listingStatus === POST_STATUS.EXPIRED

        if (isExpired) {
          expired.push(listing.title)
          removeFromCompare(listing.listingId)
        }
      })

      if (expired.length > 0) {
        setExpiredTitles(expired)
      }
    }

    checkExpiredListings()
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
        open={expiredTitles.length > 0}
        onOpenChange={(open) => {
          if (!open) setExpiredTitles([])
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('expiredDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('expiredDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <ul className='list-disc pl-5 space-y-1'>
            {expiredTitles.map((title) => (
              <li key={title} className='text-sm text-foreground'>
                {title}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button onClick={() => setExpiredTitles([])}>
              {t('expiredDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default CompareTemplate
