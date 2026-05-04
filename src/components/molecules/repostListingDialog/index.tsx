import React from 'react'
import { useTranslations } from 'next-intl'
import {
  CheckCircle2,
  Crown,
  Info,
  PackageOpen,
  Sparkles,
  Tag,
  Wallet,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
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
type PaymentProvider = 'VNPAY' | 'ZALOPAY'
type QuotaTier = 'SILVER' | 'GOLD' | 'DIAMOND'

const DURATION_OPTIONS: DurationDays[] = [10, 15, 30]
const QUOTA_DURATION_DAYS: DurationDays = 30
const PROVIDER_OPTIONS: PaymentProvider[] = ['VNPAY', 'ZALOPAY']
const QUOTA_TIERS: QuotaTier[] = ['SILVER', 'GOLD', 'DIAMOND']

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

const TIER_TO_BENEFIT: Record<QuotaTier, BenefitType> = {
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
    paymentProvider: PaymentProvider
    /** Only set on the quota path — the tier the user picked to spend. */
    vipType?: QuotaTier
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

  // Quota counts per tier, derived once from the active benefits list.
  const quotaByTier = React.useMemo<Record<QuotaTier, number>>(() => {
    const out: Record<QuotaTier, number> = { SILVER: 0, GOLD: 0, DIAMOND: 0 }
    const benefits = membership?.benefits ?? []
    for (const tier of QUOTA_TIERS) {
      const benefit: UserBenefit | undefined = benefits.find(
        (b) =>
          b.benefitType === TIER_TO_BENEFIT[tier] &&
          b.status === BenefitStatus.ACTIVE,
      )
      out[tier] = benefit?.quantityRemaining ?? 0
    }
    return out
  }, [membership?.benefits])

  const anyQuotaAvailable = QUOTA_TIERS.some((tier) => quotaByTier[tier] > 0)

  const listingVipType: VipType = (listing?.vipType ?? 'NORMAL') as VipType

  // Pick a sensible default quota tier when the user enters the quota path:
  // prefer the listing's existing tier (if it has quota), otherwise the first
  // available tier in priority order.
  const defaultQuotaTier = React.useMemo<QuotaTier | null>(() => {
    if (
      listingVipType !== 'NORMAL' &&
      quotaByTier[listingVipType as QuotaTier] > 0
    ) {
      return listingVipType as QuotaTier
    }
    return QUOTA_TIERS.find((tier) => quotaByTier[tier] > 0) ?? null
  }, [listingVipType, quotaByTier])

  const [duration, setDuration] = React.useState<DurationDays>(initialDuration)
  const [choice, setChoice] = React.useState<PaymentChoice | null>(null)
  const [provider, setProvider] = React.useState<PaymentProvider>('VNPAY')
  const [quotaTier, setQuotaTier] = React.useState<QuotaTier | null>(null)

  // Re-sync state whenever a different listing opens the dialog.
  React.useEffect(() => {
    if (open) {
      setDuration(initialDuration)
      setChoice(null)
      setProvider('VNPAY')
      setQuotaTier(defaultQuotaTier)
    }
  }, [open, initialDuration, defaultQuotaTier])

  if (!listing) return null

  const isQuota = choice === 'QUOTA'
  const isDirect = choice === 'DIRECT'

  // Quota path is locked to 30 days — that's what one quota credit covers.
  const effectiveDuration: DurationDays = isQuota
    ? QUOTA_DURATION_DAYS
    : duration
  // Show fee preview based on whichever tier is currently relevant in context.
  const previewVipType: VipType = isQuota
    ? ((quotaTier ?? listingVipType) as VipType)
    : listingVipType
  const fee = calcRepostFee(previewVipType, effectiveDuration)
  const formattedFee = formatByLocale(fee, language)

  const canConfirm = (() => {
    if (isLoading) return false
    if (isQuota) return !!quotaTier && quotaByTier[quotaTier] > 0
    if (isDirect) return true
    return false
  })()

  const handleConfirm = () => {
    if (!choice || !canConfirm) return
    onConfirm({
      listing,
      useMembershipQuota: isQuota,
      durationDays: effectiveDuration,
      paymentProvider: provider,
      vipType: isQuota ? (quotaTier ?? undefined) : undefined,
    })
  }

  const tiersWithQuotaCount = QUOTA_TIERS.filter(
    (t) => quotaByTier[t] > 0,
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl p-0 overflow-hidden gap-0'>
        {/* Header strip */}
        <div className='bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground'>
          <DialogTitle asChild>
            <div className='flex items-center gap-2 text-base font-semibold'>
              <Sparkles size={18} />
              {t('title')}
            </div>
          </DialogTitle>
          <DialogDescription className='text-primary-foreground/85 text-sm mt-1'>
            {t('description')}
          </DialogDescription>
        </div>

        <div className='px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto'>
          {/* Listing summary card */}
          <div className='rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-3'>
            <div className='shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
              <Tag size={18} />
            </div>
            <div className='flex-1 min-w-0'>
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
              <div className='mt-1.5 flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='border-primary/30 text-primary text-xs gap-1 font-medium'
                >
                  <Crown size={12} />
                  {t(`vipTypes.${listingVipType}`)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment options */}
          <section>
            <Typography
              variant='small'
              className='font-semibold text-sm mb-2 block'
            >
              {t('paymentLabel')}
            </Typography>
            <div className='space-y-2'>
              {/* Quota card */}
              <button
                type='button'
                disabled={isLoading || !anyQuotaAvailable}
                onClick={() => setChoice('QUOTA')}
                aria-pressed={isQuota}
                className={cn(
                  'group w-full text-left rounded-lg border-2 p-3.5 transition-all flex items-start gap-3',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isQuota
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/40',
                  !anyQuotaAvailable && 'opacity-60 cursor-not-allowed',
                )}
              >
                <div
                  className={cn(
                    'shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isQuota
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <PackageOpen size={20} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <Typography variant='small' className='font-semibold'>
                      {t('quota.title')}
                    </Typography>
                    {anyQuotaAvailable && (
                      <Badge className='bg-primary/15 text-primary border-0 text-2xs uppercase tracking-wide'>
                        {t('quota.recommended')}
                      </Badge>
                    )}
                  </div>
                  <Typography
                    variant='small'
                    className='text-xs text-muted-foreground mt-0.5'
                  >
                    {anyQuotaAvailable
                      ? t('quota.summary', { count: tiersWithQuotaCount })
                      : t('quota.noneAvailable')}
                  </Typography>
                </div>
              </button>

              {/* Direct payment card */}
              <button
                type='button'
                disabled={isLoading}
                onClick={() => setChoice('DIRECT')}
                aria-pressed={isDirect}
                className={cn(
                  'group w-full text-left rounded-lg border-2 p-3.5 transition-all flex items-start gap-3',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isDirect
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/40',
                )}
              >
                <div
                  className={cn(
                    'shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isDirect
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <Wallet size={20} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <Typography variant='small' className='font-semibold'>
                      {t('direct.title')}
                    </Typography>
                    {isDirect && (
                      <Typography
                        variant='small'
                        className='font-bold text-primary text-sm whitespace-nowrap'
                      >
                        {formattedFee}
                      </Typography>
                    )}
                  </div>
                  <Typography
                    variant='small'
                    className='text-xs text-muted-foreground mt-0.5'
                  >
                    {t('direct.subtitle')}
                  </Typography>
                </div>
              </button>
            </div>
          </section>

          {/* Quota path: tier picker (đăng lại có thể chọn lại bạc / vàng / kim cương) */}
          {isQuota && (
            <section className='space-y-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-4'>
              <div>
                <Typography
                  variant='small'
                  className='font-semibold text-sm block'
                >
                  {t('quota.tierLabel')}
                </Typography>
                <Typography
                  variant='small'
                  className='text-xs text-muted-foreground mt-0.5'
                >
                  {t('quota.tierHelp')}
                </Typography>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {QUOTA_TIERS.map((tier) => {
                  const remaining = quotaByTier[tier]
                  const enabled = remaining > 0
                  const selected = quotaTier === tier
                  const isCurrent = tier === listingVipType
                  return (
                    <button
                      key={tier}
                      type='button'
                      disabled={isLoading || !enabled}
                      onClick={() => setQuotaTier(tier)}
                      aria-pressed={selected}
                      className={cn(
                        'relative rounded-md border-2 p-3 text-center transition-colors flex flex-col items-center gap-1',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : enabled
                            ? 'border-border bg-background hover:border-primary/40'
                            : 'border-border bg-muted/30 opacity-60 cursor-not-allowed',
                      )}
                    >
                      {isCurrent && (
                        <span
                          className={cn(
                            'absolute -top-2 right-1 rounded-full px-1.5 py-0.5 text-2xs font-semibold',
                            selected
                              ? 'bg-primary-foreground text-primary'
                              : 'bg-primary/15 text-primary',
                          )}
                        >
                          {t('quota.currentTierBadge')}
                        </span>
                      )}
                      <Crown size={16} />
                      <Typography
                        variant='small'
                        className='font-semibold text-sm'
                      >
                        {t(`vipTypes.${tier}`)}
                      </Typography>
                      <Typography
                        variant='small'
                        className={cn(
                          'text-xs',
                          selected
                            ? 'text-primary-foreground/85'
                            : 'text-muted-foreground',
                        )}
                      >
                        {enabled
                          ? t('quota.remaining', { count: remaining })
                          : t('quota.empty')}
                      </Typography>
                    </button>
                  )
                })}
              </div>

              {quotaTier && (
                <div className='flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs'>
                  <Info size={14} className='shrink-0 mt-0.5 text-primary' />
                  <span className='text-foreground/80'>
                    {quotaTier !== (listingVipType as QuotaTier) &&
                    listingVipType !== 'NORMAL'
                      ? t('quota.switchHint', {
                          from: t(`vipTypes.${listingVipType}`),
                          to: t(`vipTypes.${quotaTier}`),
                          days: QUOTA_DURATION_DAYS,
                        })
                      : t('quota.durationLockedHint', {
                          days: QUOTA_DURATION_DAYS,
                        })}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Direct-payment options: provider + duration */}
          {isDirect && (
            <section className='space-y-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4'>
              {/* Provider selector */}
              <div>
                <Typography
                  variant='small'
                  className='font-semibold text-sm mb-2 block'
                >
                  {t('providerLabel')}
                </Typography>
                <div className='grid grid-cols-2 gap-2'>
                  {PROVIDER_OPTIONS.map((p) => {
                    const selected = provider === p
                    return (
                      <button
                        key={p}
                        type='button'
                        disabled={isLoading}
                        onClick={() => setProvider(p)}
                        aria-pressed={selected}
                        className={cn(
                          'rounded-md border-2 px-3 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/40',
                        )}
                      >
                        {selected && <CheckCircle2 size={14} />}
                        {t(`providers.${p}`)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <Typography
                  variant='small'
                  className='font-semibold text-sm mb-2 block'
                >
                  {t('durationLabel')}
                </Typography>
                <div className='grid grid-cols-3 gap-2'>
                  {DURATION_OPTIONS.map((days) => {
                    const selected = duration === days
                    const discount = DURATION_DISCOUNT[days]
                    return (
                      <button
                        key={days}
                        type='button'
                        disabled={isLoading}
                        onClick={() => setDuration(days)}
                        aria-pressed={selected}
                        className={cn(
                          'relative rounded-md border-2 px-3 py-2.5 text-sm font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/40',
                        )}
                      >
                        {discount > 0 && !selected && (
                          <span className='absolute -top-2 -right-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 px-1.5 py-0.5 text-2xs font-semibold'>
                            -{Math.round(discount * 100)}%
                          </span>
                        )}
                        {t('durationOption', { days })}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Total */}
              <div className='flex items-center justify-between pt-2 border-t border-primary/15'>
                <Typography variant='small' className='text-sm font-medium'>
                  {t('totalLabel')}
                </Typography>
                <Typography
                  variant='small'
                  className='text-lg font-bold text-primary'
                >
                  {formattedFee}
                </Typography>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-border bg-muted/20 px-6 py-4 flex gap-3 justify-end'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            disabled={!canConfirm || !choice}
            onClick={handleConfirm}
            className='min-w-[120px]'
          >
            {isLoading ? t('loading') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
