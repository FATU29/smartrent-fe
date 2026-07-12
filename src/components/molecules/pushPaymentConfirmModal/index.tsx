'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Rocket, Wallet } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/useLanguage'
import { formatByLocale } from '@/utils/currency/convert'
import { ListingOwnerDetail } from '@/api/types'

// Mirrors PricingConstants.PUSH_PER_TIME in the backend (smart-rent) — the
// one-time push fee charged when a seller has no push quota left.
const SINGLE_PUSH_PRICE_VND = 40000

export interface PushPaymentConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: ListingOwnerDetail | null
  isLoading?: boolean
  onConfirm: () => void
}

export const PushPaymentConfirmModal: React.FC<
  PushPaymentConfirmModalProps
> = ({ open, onOpenChange, listing, isLoading = false, onConfirm }) => {
  const t = useTranslations('seller.listingManagement.card.pushPaymentDialog')
  const { language } = useLanguage()
  const priceLabel = formatByLocale(SINGLE_PUSH_PRICE_VND, language)

  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md p-0 overflow-hidden gap-0'>
        <div className='bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground'>
          <DialogHeader className='gap-1.5'>
            <DialogTitle asChild>
              <div className='flex items-center gap-2 text-base font-semibold'>
                <Rocket size={18} />
                {t('title')}
              </div>
            </DialogTitle>
            <DialogDescription className='text-primary-foreground/90 text-sm'>
              {t('description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='px-6 py-5 space-y-4'>
          <div className='rounded-lg border border-border bg-muted/30 p-3'>
            <Typography
              variant='small'
              className='text-xs text-muted-foreground'
            >
              {t('listingLabel')}
            </Typography>
            <Typography
              variant='small'
              className='font-semibold line-clamp-1 mt-0.5'
            >
              {listing.title}
            </Typography>
          </div>

          <div
            className={cn(
              'rounded-lg border-2 border-primary/30 bg-primary/[0.04] p-4',
              'flex items-center gap-3',
            )}
          >
            <div className='shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground'>
              <Wallet size={20} />
            </div>
            <div className='flex-1 min-w-0'>
              <Typography variant='small' className='font-semibold'>
                {t('price.title')}
              </Typography>
              <Typography
                variant='small'
                className='text-lg font-bold text-primary mt-0.5 block'
              >
                {priceLabel}
              </Typography>
            </div>
          </div>

          <Typography variant='small' className='text-xs text-muted-foreground'>
            {t('hint')}
          </Typography>
        </div>

        <div className='border-t border-border bg-muted/20 px-6 py-4 flex gap-3 justify-end'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            disabled={isLoading}
            onClick={onConfirm}
            className='min-w-[140px]'
          >
            {isLoading ? t('loading') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PushPaymentConfirmModal
