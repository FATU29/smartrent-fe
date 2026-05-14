import React from 'react'
import { useTranslations } from 'next-intl'
import {
  CalendarPlus,
  Clock,
  Crown,
  PackageOpen,
  Sparkles,
  Tag,
  TriangleAlert,
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
import {
  BenefitStatus,
  BenefitType,
  type UserBenefit,
} from '@/api/types/membership.type'
import { ListingOwnerDetail, VipType } from '@/api/types'

type RenewableTier = 'SILVER' | 'GOLD' | 'DIAMOND'

const TIER_TO_BENEFIT: Record<RenewableTier, BenefitType> = {
  SILVER: BenefitType.POST_SILVER,
  GOLD: BenefitType.POST_GOLD,
  DIAMOND: BenefitType.POST_DIAMOND,
}

const TIER_THEME: Record<
  RenewableTier,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>
    pill: string
  }
> = {
  SILVER: { icon: Tag, pill: 'bg-gray-100 text-gray-700' },
  GOLD: { icon: Crown, pill: 'bg-yellow-100 text-yellow-700' },
  DIAMOND: { icon: Sparkles, pill: 'bg-blue-100 text-blue-700' },
}

const DAYS_ADDED = 30

const isRenewableTier = (v: VipType | undefined): v is RenewableTier =>
  v === 'SILVER' || v === 'GOLD' || v === 'DIAMOND'

const formatDate = (iso: string | null | undefined, locale: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export interface RenewListingDialogProps {
  listing: ListingOwnerDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (params: { listing: ListingOwnerDetail }) => void
  isLoading?: boolean
}

export const RenewListingDialog: React.FC<RenewListingDialogProps> = ({
  listing,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const t = useTranslations('seller.listingManagement.card.renewDialog')
  const { user } = useAuthContext()
  const { data: membership } = useMyMembership(user?.userId)

  const listingVipType = (listing?.vipType ?? 'NORMAL') as VipType
  const tier = isRenewableTier(listingVipType) ? listingVipType : null

  // Remaining quota of the listing's current tier — the renewal feature is
  // strictly "use the same-type benefit", so we don't surface tier switching
  // here (that's what the repost dialog does for expired listings).
  // Keep this hook above the `!listing` early return so the hook count stays
  // stable across renders (React error #310).
  const remainingQuota = React.useMemo<number>(() => {
    if (!tier) return 0
    const benefit: UserBenefit | undefined = (membership?.benefits ?? []).find(
      (b) =>
        b.benefitType === TIER_TO_BENEFIT[tier] &&
        b.status === BenefitStatus.ACTIVE,
    )
    return benefit?.quantityRemaining ?? 0
  }, [membership?.benefits, tier])

  if (!listing) return null

  const currentExpiry = listing.expiryDate ?? null
  const now = new Date()
  // Mirror the BE: cumulative extension anchored on whichever is later between
  // the current expiry and "now". Keeps the FE preview consistent with the
  // actual server-side mutation.
  const anchorDate = (() => {
    if (!currentExpiry) return now
    const d = new Date(currentExpiry)
    if (Number.isNaN(d.getTime())) return now
    return d.getTime() > now.getTime() ? d : now
  })()
  const newExpiry = new Date(
    anchorDate.getTime() + DAYS_ADDED * 24 * 60 * 60 * 1000,
  )

  const locale = typeof navigator !== 'undefined' ? navigator.language : 'vi-VN'
  const canConfirm = !!tier && remainingQuota > 0 && !isLoading

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({ listing })
  }

  const TierIcon = tier ? TIER_THEME[tier].icon : Tag

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg p-0 overflow-hidden gap-0'>
        {/* Header strip */}
        <div className='bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-5 text-white'>
          <DialogTitle asChild>
            <div className='flex items-center gap-2 text-base font-semibold'>
              <CalendarPlus size={18} />
              {t('title')}
            </div>
          </DialogTitle>
          <DialogDescription className='text-white/90 text-sm mt-1'>
            {t('description', { days: DAYS_ADDED })}
          </DialogDescription>
        </div>

        <div className='px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto'>
          {/* Listing summary */}
          <div className='rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-3'>
            <div
              className={cn(
                'shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
                tier ? TIER_THEME[tier].pill : 'bg-muted text-muted-foreground',
              )}
            >
              <TierIcon size={18} />
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

          {/* Expiry preview */}
          <section className='rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 space-y-3'>
            <div className='flex items-center gap-2'>
              <Clock
                size={16}
                className='text-emerald-600 dark:text-emerald-400'
              />
              <Typography
                variant='small'
                className='font-semibold text-sm text-emerald-900 dark:text-emerald-200'
              >
                {t('preview.title', { days: DAYS_ADDED })}
              </Typography>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Typography
                  variant='small'
                  className='text-xs text-muted-foreground'
                >
                  {t('preview.currentExpiry')}
                </Typography>
                <Typography
                  variant='small'
                  className='font-semibold mt-0.5 block'
                >
                  {formatDate(currentExpiry, locale) || t('preview.unknown')}
                </Typography>
              </div>
              <div>
                <Typography
                  variant='small'
                  className='text-xs text-muted-foreground'
                >
                  {t('preview.newExpiry')}
                </Typography>
                <Typography
                  variant='small'
                  className='font-semibold mt-0.5 block text-emerald-700 dark:text-emerald-300'
                >
                  {formatDate(newExpiry.toISOString(), locale)}
                </Typography>
              </div>
            </div>
          </section>

          {/* Quota state */}
          <section
            className={cn(
              'rounded-lg border-2 p-3.5 flex items-start gap-3',
              tier && remainingQuota > 0
                ? 'border-primary/30 bg-primary/[0.04]'
                : 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
            )}
          >
            <div
              className={cn(
                'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                tier && remainingQuota > 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
              )}
            >
              {tier && remainingQuota > 0 ? (
                <PackageOpen size={20} />
              ) : (
                <TriangleAlert size={20} />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <Typography variant='small' className='font-semibold'>
                {tier
                  ? t('quota.title', { tier: t(`vipTypes.${tier}`) })
                  : t('quota.noTierTitle')}
              </Typography>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground mt-0.5'
              >
                {!tier
                  ? t('quota.noTierHint')
                  : remainingQuota > 0
                    ? t('quota.remaining', { count: remainingQuota })
                    : t('quota.empty', { tier: t(`vipTypes.${tier}`) })}
              </Typography>
            </div>
          </section>
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
            disabled={!canConfirm}
            onClick={handleConfirm}
            className='min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white'
          >
            {isLoading ? t('loading') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RenewListingDialog
