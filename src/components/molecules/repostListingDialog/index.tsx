import React from 'react'
import { useTranslations } from 'next-intl'
import { CreditCard, PackageOpen, Crown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/auth'
import { useMyMembership } from '@/hooks/useMembership'
import { useLanguage } from '@/hooks/useLanguage'
import { formatByLocale } from '@/utils/currency/convert'
import {
  BenefitStatus,
  BenefitType,
  type UserBenefit,
} from '@/api/types/membership.type'
import { ListingOwnerDetail, VipType } from '@/api/types'

type DurationDays = 10 | 15 | 30

type PaymentChoice = 'QUOTA' | 'DIRECT'

const DURATION_OPTIONS: DurationDays[] = [10, 15, 30]

// Mirror of BE PricingConstants — keep in sync with
// smart-rent/src/main/java/com/smartrent/constants/PricingConstants.java.
// Used for FE display only; the server is authoritative on the actual fee.
const PRICE_PER_DAY: Record<VipType, number> = {
  NORMAL: 2700,
  SILVER: 50000,
  GOLD: 110000,
  DIAMOND: 280000,
}

const DURATION_DISCOUNT: Record<DurationDays, number> = {
  10: 0,
  15: 0.11,
  30: 0.185,
}

const calcRepostFee = (vipType: VipType, days: DurationDays): number => {
  const base = PRICE_PER_DAY[vipType] ?? PRICE_PER_DAY.NORMAL
  const discount = DURATION_DISCOUNT[days] ?? 0
  return Math.round(base * days * (1 - discount))
}

const VIP_TO_BENEFIT: Partial<Record<VipType, BenefitType>> = {
  SILVER: BenefitType.POST_SILVER,
  GOLD: BenefitType.POST_GOLD,
  DIAMOND: BenefitType.POST_DIAMOND,
}

export interface RepostListingDialogProps {
  listing: ListingOwnerDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (params: {
    listing: ListingOwnerDetail
    useMembershipQuota: boolean
    durationDays: DurationDays
  }) => void
  isLoading?: boolean
}

export const RepostListingDialog: React.FC<RepostListingDialogProps> = ({
  listing,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const t = useTranslations('seller.listingManagement.card.repostDialog')
  const { user } = useAuthContext()
  const { data: membership } = useMyMembership(user?.userId)
  const { language } = useLanguage()

  const initialDuration: DurationDays = React.useMemo(() => {
    const existing = listing?.durationDays as number | undefined
    if (existing && DURATION_OPTIONS.includes(existing as DurationDays)) {
      return existing as DurationDays
    }
    return 30
  }, [listing?.durationDays])

  const [duration, setDuration] = React.useState<DurationDays>(initialDuration)
  const [choice, setChoice] = React.useState<PaymentChoice | null>(null)

  // Re-sync duration whenever a different listing opens the dialog.
  React.useEffect(() => {
    if (open) {
      setDuration(initialDuration)
      setChoice(null)
    }
  }, [open, initialDuration])

  if (!listing) return null

  const vipType: VipType = (listing.vipType ?? 'NORMAL') as VipType
  const benefitType = VIP_TO_BENEFIT[vipType]
  const matchingBenefit: UserBenefit | undefined =
    benefitType && membership?.benefits
      ? membership.benefits.find(
          (b) =>
            b.benefitType === benefitType && b.status === BenefitStatus.ACTIVE,
        )
      : undefined
  const quotaRemaining = matchingBenefit?.quantityRemaining ?? 0
  const quotaAvailable = !!benefitType && quotaRemaining > 0

  const fee = calcRepostFee(vipType, duration)
  const formattedFee = formatByLocale(fee, language)

  const handleConfirm = () => {
    if (!choice) return
    onConfirm({
      listing,
      useMembershipQuota: choice === 'QUOTA',
      durationDays: duration,
    })
  }

  const quotaSubtitleKey = !benefitType
    ? 'quota.notApplicable'
    : quotaRemaining > 0
      ? 'quota.available'
      : 'quota.exhausted'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogTitle className='flex items-center gap-2 text-cyan-700 dark:text-cyan-400'>
          <Crown size={20} />
          {t('title')}
        </DialogTitle>
        <DialogDescription>{t('description')}</DialogDescription>

        {/* Listing summary */}
        <div className='mt-2 rounded-md border border-muted bg-muted/30 p-3'>
          <Typography variant='small' className='text-muted-foreground'>
            {t('listingLabel')}
          </Typography>
          <Typography variant='small' className='font-semibold line-clamp-2'>
            {listing.title}
          </Typography>
          <Typography variant='small' className='text-xs text-muted-foreground'>
            {t('vipType', { type: t(`vipTypes.${vipType}`) })}
          </Typography>
        </div>

        {/* Duration selector */}
        <div className='mt-2'>
          <Typography
            variant='small'
            className='font-medium text-sm mb-2 block'
          >
            {t('durationLabel')}
          </Typography>
          <div className='grid grid-cols-3 gap-2'>
            {DURATION_OPTIONS.map((days) => {
              const selected = duration === days
              return (
                <button
                  key={days}
                  type='button'
                  disabled={isLoading}
                  onClick={() => setDuration(days)}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    selected
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300'
                      : 'border-muted hover:border-muted-foreground/30',
                  )}
                >
                  {t('durationOption', { days })}
                </button>
              )
            })}
          </div>
        </div>

        {/* Payment options */}
        <div className='mt-2 space-y-2'>
          <Typography
            variant='small'
            className='font-medium text-sm mb-2 block'
          >
            {t('paymentLabel')}
          </Typography>

          {/* Use quota */}
          <button
            type='button'
            disabled={isLoading || !quotaAvailable}
            onClick={() => setChoice('QUOTA')}
            className={cn(
              'w-full text-left rounded-lg border p-3 transition-colors flex items-start gap-3',
              choice === 'QUOTA'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10'
                : 'border-muted hover:border-muted-foreground/30',
              !quotaAvailable && 'opacity-60 cursor-not-allowed',
            )}
          >
            <PackageOpen
              size={20}
              className='mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400'
            />
            <div className='flex-1 min-w-0'>
              <Typography variant='small' className='font-semibold'>
                {t('quota.title')}
              </Typography>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t(quotaSubtitleKey, { count: quotaRemaining })}
              </Typography>
            </div>
          </button>

          {/* Buy directly */}
          <button
            type='button'
            disabled={isLoading}
            onClick={() => setChoice('DIRECT')}
            className={cn(
              'w-full text-left rounded-lg border p-3 transition-colors flex items-start gap-3',
              choice === 'DIRECT'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10'
                : 'border-muted hover:border-muted-foreground/30',
            )}
          >
            <CreditCard
              size={20}
              className='mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400'
            />
            <div className='flex-1 min-w-0'>
              <Typography variant='small' className='font-semibold'>
                {t('direct.title')}
              </Typography>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t('direct.subtitle', { price: formattedFee })}
              </Typography>
            </div>
          </button>
        </div>

        <div className='flex gap-3 justify-end pt-3'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            disabled={isLoading || !choice}
            onClick={handleConfirm}
            className='bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700'
          >
            {isLoading ? t('loading') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
