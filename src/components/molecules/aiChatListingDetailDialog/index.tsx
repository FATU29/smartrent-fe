import React, { FC, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from '@/components/atoms/dialog'
import { Skeleton } from '@/components/atoms/skeleton'
import { Button } from '@/components/atoms/button'
import DetailPostTemplate from '@/components/templates/detailPostTemplate'
import { ListingService } from '@/api/services'
import type { ListingDetail } from '@/api/types'

type TAiChatListingDetailDialogProps = {
  listingId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AiChatListingDetailDialog: FC<TAiChatListingDetailDialogProps> = ({
  listingId,
  open,
  onOpenChange,
}) => {
  const t = useTranslations('chat.listing')
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !listingId) return

    let cancelled = false
    setIsLoading(true)
    setError(null)
    setListing(null)

    ListingService.getById(listingId)
      .then((res) => {
        if (cancelled) return
        if (res?.data) {
          setListing(res.data)
        } else {
          setError(res?.message || 'Not found')
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(String(err))
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, listingId])

  const headerTitle = listing?.title || t('viewDetails')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='w-[95vw] max-w-3xl h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl'
        showCloseButton={false}
        aria-describedby={undefined}
      >
        {/* Sticky header */}
        <div className='flex items-center gap-3 px-5 py-3.5 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0'>
          <DialogTitle className='flex-1 min-w-0 text-base font-semibold text-foreground truncate'>
            {isLoading ? (
              <VisuallyHidden>{t('viewDetails')}</VisuallyHidden>
            ) : (
              headerTitle
            )}
          </DialogTitle>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-full flex-shrink-0 hover:bg-muted'
            onClick={() => onOpenChange(false)}
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className='flex-1 overflow-y-auto overflow-x-hidden bg-background'>
          {isLoading && (
            <div className='px-5 py-5 space-y-4'>
              <Skeleton className='w-full h-[240px] sm:h-[320px] md:h-[380px] rounded-xl' />
              <div className='flex gap-2'>
                <Skeleton className='w-16 h-14 rounded-md' />
                <Skeleton className='w-16 h-14 rounded-md' />
                <Skeleton className='w-16 h-14 rounded-md' />
              </div>
              <Skeleton className='w-3/4 h-7 rounded-md' />
              <Skeleton className='w-1/3 h-5 rounded-md' />
              <Skeleton className='w-full h-32 rounded-md' />
              <Skeleton className='w-full h-24 rounded-md' />
            </div>
          )}

          {!isLoading && error && (
            <div className='flex h-full items-center justify-center p-10 text-center'>
              <p className='text-sm text-muted-foreground'>{error}</p>
            </div>
          )}

          {!isLoading && !error && listing && (
            <div className='px-5 py-5'>
              <DetailPostTemplate listing={listing} embedded />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AiChatListingDetailDialog
