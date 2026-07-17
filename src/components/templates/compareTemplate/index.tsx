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
import { ListingApi } from '@/api/types/property.type'

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
  // Full listing detail fetched per id, keyed by listingId. sessionStorage only
  // holds whatever partial shape the entry point (card, AI mini, detail header)
  // happened to store, so the table must render from this, not from compareList.
  const [detailsById, setDetailsById] = useState<Record<number, ListingApi>>({})
  const fetchedIdsRef = useRef<Set<number>>(new Set())

  // Handle hydration: Wait for Zustand store to hydrate from localStorage
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Hydrate each compared listing from the live detail endpoint (the same
  // GET /listings/{id} the detail page uses), then render from that — the
  // sessionStorage entry is only a partial snapshot and also goes stale once a
  // listing's price/status changes. The endpoint 404s expired/rejected/deleted
  // listings identically, so "no data back" doubles as the availability signal:
  // those get pulled from the compare list and surfaced in the dialog.
  useEffect(() => {
    if (!isMounted || compareList.length === 0) {
      return
    }

    const pending = compareList.filter(
      (listing) => !fetchedIdsRef.current.has(listing.listingId),
    )
    if (pending.length === 0) {
      return
    }
    pending.forEach((listing) => fetchedIdsRef.current.add(listing.listingId))

    let cancelled = false

    const hydrateAndValidate = async () => {
      const responses = await Promise.all(
        pending.map((listing) => ListingService.getById(listing.listingId)),
      )
      if (cancelled) {
        return
      }

      const nextDetails: Record<number, ListingApi> = {}
      const unavailable: string[] = []

      responses.forEach((response, index) => {
        const listing = pending[index]
        if (response.success && response.data) {
          nextDetails[listing.listingId] = response.data
        } else {
          unavailable.push(listing.title)
          removeFromCompare(listing.listingId)
        }
      })

      if (Object.keys(nextDetails).length > 0) {
        setDetailsById((prev) => ({ ...prev, ...nextDetails }))
      }
      if (unavailable.length > 0) {
        setUnavailableTitles((prev) => [...prev, ...unavailable])
      }
    }

    hydrateAndValidate()

    return () => {
      cancelled = true
    }
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
  // Prefer the full detail; fall back to the stored partial while it loads so
  // the table still paints immediately instead of flashing empty columns.
  const displayListings = compareList.map(
    (listing) => detailsById[listing.listingId] ?? listing,
  )

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
        <CompareTable listings={displayListings} />
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
