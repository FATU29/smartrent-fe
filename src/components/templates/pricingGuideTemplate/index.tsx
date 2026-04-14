import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Layers3,
  Sparkles,
  TrendingUp,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'
import type { MembershipPackageLevel } from '@/api/types/membership.type'
import type { VipTier } from '@/api/types/vip-tier.type'
import { useMembershipPackages } from '@/hooks/useMembership'
import { useVipTiers } from '@/hooks/useVipTiers'
import { MembershipPlansGrid } from '@/components/templates/membershipRegisterTemplate/MembershipPlansGrid'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'
import { SELLERNET_ROUTES } from '@/constants/route'
import { cn } from '@/lib/utils'

type TierVisualCode = 'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD'

const LISTING_TYPE_STYLES: Record<
  TierVisualCode,
  {
    cardClass: string
    badgeClass: string
    titleClass: string
    iconClass: string
  }
> = {
  DIAMOND: {
    cardClass: 'border-primary/25 bg-primary/5',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    titleClass: 'text-primary',
    iconClass: 'text-primary',
  },
  GOLD: {
    cardClass: 'border-amber-200 bg-amber-50/70',
    badgeClass: 'border-amber-200 bg-amber-100 text-amber-800',
    titleClass: 'text-amber-800',
    iconClass: 'text-amber-700',
  },
  SILVER: {
    cardClass: 'border-slate-200 bg-slate-50/70',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
    titleClass: 'text-slate-700',
    iconClass: 'text-slate-600',
  },
  STANDARD: {
    cardClass: 'border-border bg-muted/20',
    badgeClass: 'border-border bg-background text-foreground',
    titleClass: 'text-foreground',
    iconClass: 'text-muted-foreground',
  },
}

const MEMBERSHIP_ORDER: Record<MembershipPackageLevel, number> = {
  BASIC: 1,
  STANDARD: 2,
  ADVANCED: 3,
}

const normalizeTierCode = (tierCode?: string): TierVisualCode => {
  const normalized = (tierCode || 'NORMAL').toUpperCase()
  if (normalized === 'DIAMOND') return 'DIAMOND'
  if (normalized === 'GOLD') return 'GOLD'
  if (normalized === 'SILVER') return 'SILVER'
  return 'STANDARD'
}

const getTierPriorityTranslationKey = (rank: number) => {
  if (rank === 0) return 'highest'
  if (rank === 1) return 'high'
  return 'normal'
}

const getListingTypeTranslationKey = (tierCode: string) => {
  switch (normalizeTierCode(tierCode)) {
    case 'DIAMOND':
      return 'vipDiamond'
    case 'GOLD':
      return 'vipGold'
    case 'SILVER':
      return 'vipSilver'
    case 'STANDARD':
    default:
      return 'standard'
  }
}

const PricingGuideTemplate: React.FC = () => {
  const t = useTranslations('guides.pricing')
  const locale = useLocale()
  const router = useRouter()

  const {
    data: memberships = [],
    isLoading: membershipsLoading,
    error: membershipsError,
  } = useMembershipPackages()

  const {
    data: vipTiers = [],
    isLoading: vipTiersLoading,
    error: vipTiersError,
  } = useVipTiers()

  const isLoading = membershipsLoading || vipTiersLoading
  const errorMessage =
    membershipsError instanceof Error
      ? membershipsError.message
      : vipTiersError instanceof Error
        ? vipTiersError.message
        : null

  const formatPrice = React.useCallback(
    (price: number) =>
      new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(price),
    [locale],
  )

  const sortedMemberships = React.useMemo(() => {
    return [...memberships].sort((a, b) => {
      const aOrder =
        MEMBERSHIP_ORDER[a.packageLevel as MembershipPackageLevel] || 99
      const bOrder =
        MEMBERSHIP_ORDER[b.packageLevel as MembershipPackageLevel] || 99
      return aOrder - bOrder
    })
  }, [memberships])

  const vipTiersByPrice = React.useMemo(() => {
    return [...vipTiers].sort((a, b) => {
      const byTenDays = (b.price10Days || 0) - (a.price10Days || 0)
      if (byTenDays !== 0) return byTenDays

      const byPerDay = (b.pricePerDay || 0) - (a.pricePerDay || 0)
      if (byPerDay !== 0) return byPerDay

      return (b.tierLevel || 0) - (a.tierLevel || 0)
    })
  }, [vipTiers])

  const priceRange = vipTiersByPrice.length
    ? {
        min: Math.min(...vipTiersByPrice.map((tier) => tier.pricePerDay || 0)),
        max: Math.max(...vipTiersByPrice.map((tier) => tier.pricePerDay || 0)),
      }
    : { min: 0, max: 0 }

  const membershipStats = {
    packages: sortedMemberships.length,
    listingTypes: vipTiersByPrice.length,
  }

  const handleOpenMembershipRegister = React.useCallback(() => {
    router.push(SELLERNET_ROUTES.MEMBERSHIP_REGISTER)
  }, [router])

  const handleMembershipPlanSelect = React.useCallback(() => {
    handleOpenMembershipRegister()
  }, [handleOpenMembershipRegister])

  const getTierDisplayName = React.useCallback(
    (tier: VipTier, fallbackName: string) => {
      if (locale === 'vi') {
        return tier.tierName || fallbackName
      }
      return tier.tierNameEn || tier.tierName || fallbackName
    },
    [locale],
  )

  const renderVipTierCard = (tier: VipTier, rank: number) => {
    const normalizedTierCode = normalizeTierCode(tier.tierCode)
    const style = LISTING_TYPE_STYLES[normalizedTierCode]
    const translationKey = getListingTypeTranslationKey(tier.tierCode)
    const tierName = getTierDisplayName(
      tier,
      t(`postTypes.${translationKey}.name`),
    )

    return (
      <div
        className={cn(
          'flex h-full flex-col rounded-xl border p-4',
          style.cardClass,
        )}
      >
        <div className='mb-2 flex items-start justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-2'>
            <Crown className={cn('h-4 w-4', style.iconClass)} />
            <div
              className={cn(
                'min-w-0 text-base font-semibold sm:text-lg',
                style.titleClass,
              )}
            >
              <span className='block truncate'>{tierName}</span>
            </div>
          </div>
          <Badge
            variant='outline'
            className={cn('whitespace-nowrap', style.badgeClass)}
          >
            {t(`postTypes.priority.${getTierPriorityTranslationKey(rank)}`)}
          </Badge>
        </div>

        <div className='mb-4 h-10 overflow-hidden text-sm leading-5 text-muted-foreground'>
          {t(`postTypes.${translationKey}.description`)}
        </div>

        <div className='mt-auto space-y-2 text-sm'>
          {[10, 15, 30].map((days) => {
            const priceByDuration: Record<number, number> = {
              10: tier.price10Days || 0,
              15: tier.price15Days || 0,
              30: tier.price30Days || 0,
            }

            return (
              <div
                key={`${tier.tierId}-duration-${days}`}
                className='flex items-center justify-between gap-3 rounded-md border bg-background/70 px-3 py-2'
              >
                <span className='whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm'>
                  {t('postTypes.duration')} {days} {t('postTypes.days')}
                </span>
                <span className='whitespace-nowrap text-right text-xs font-semibold sm:text-sm'>
                  {formatPrice(priceByDuration[days])} {t('currencySymbol')}
                </span>
              </div>
            )
          })}

          <div className='flex items-center justify-between gap-3 rounded-md border bg-background/70 px-3 py-2'>
            <span className='whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm'>
              {t('postTypes.pricePerDay')}
            </span>
            <span className='whitespace-nowrap text-right text-xs font-semibold sm:text-sm'>
              {formatPrice(tier.pricePerDay || 0)} {t('currencySymbol')}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='rounded-2xl border p-6'>
          <Skeleton className='mb-3 h-8 w-56 bg-muted' />
          <Skeleton className='h-4 w-full max-w-2xl bg-muted' />
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          <Skeleton className='h-24 w-full bg-muted' />
          <Skeleton className='h-24 w-full bg-muted' />
          <Skeleton className='h-24 w-full bg-muted' />
        </div>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <Skeleton className='h-14 w-full bg-muted' />
              <Skeleton className='h-14 w-full bg-muted' />
              <Skeleton className='h-14 w-full bg-muted' />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <Card className='border-dashed py-0'>
        <CardContent className='flex flex-col items-center gap-3 py-10 text-center'>
          <AlertCircle className='h-10 w-10 text-muted-foreground' />
          <Typography variant='h4'>{t('errorTitle')}</Typography>
          <Typography variant='muted'>{t('error')}</Typography>
          <Typography variant='small' className='text-muted-foreground'>
            {errorMessage}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-7 pt-2 md:space-y-8 md:pt-3'>
      <section className='rounded-2xl border bg-card p-6 md:p-8'>
        <div>
          <Badge
            variant='outline'
            className='mb-3 gap-1.5 border-primary/30 bg-primary/10 text-primary'
          >
            <Sparkles className='mr-1 h-3.5 w-3.5' />
            {t('hero.badge')}
          </Badge>
          <Typography variant='h2' className='mb-2 flex items-center gap-2'>
            <Layers3 className='h-5 w-5 text-primary' />
            {t('title')}
          </Typography>
          <Typography
            variant='muted'
            className='max-w-3xl text-base leading-relaxed'
          >
            {t('description')}
          </Typography>
        </div>
      </section>

      <section className='grid gap-3 md:grid-cols-3'>
        <Card className='border-primary/20 bg-primary/5 py-0'>
          <CardHeader className='pt-5 pb-3 md:pt-6'>
            <CardDescription className='flex items-center gap-2'>
              <BadgeCheck className='h-4 w-4 text-primary' />
              <span>{t('hero.metrics.packageCount')}</span>
            </CardDescription>
            <CardTitle className='text-3xl text-primary'>
              {membershipStats.packages}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className='border-accent bg-accent/30 py-0'>
          <CardHeader className='pt-5 pb-3 md:pt-6'>
            <CardDescription className='flex items-center gap-2'>
              <Crown className='h-4 w-4 text-muted-foreground' />
              <span>{t('hero.metrics.listingTypeCount')}</span>
            </CardDescription>
            <CardTitle className='text-3xl'>
              {membershipStats.listingTypes}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className='bg-muted/20 py-0'>
          <CardHeader className='pt-5 pb-3 md:pt-6'>
            <CardDescription className='flex items-center gap-2'>
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
              <span>{t('hero.metrics.priceRange')}</span>
            </CardDescription>
            <CardTitle className='text-xl'>
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
              <span className='ml-1 text-sm font-medium text-muted-foreground'>
                {t('hero.metrics.currencyPerDay')}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section>
        <Card className='py-0'>
          <CardHeader className='pt-5 pb-3 md:pt-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div className='space-y-1'>
                <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                  <BadgeCheck className='h-5 w-5 text-primary' />
                  <span className='break-words'>{t('membership.title')}</span>
                </CardTitle>
                <CardDescription>{t('membership.description')}</CardDescription>
              </div>
              <Button
                variant='outline'
                onClick={handleOpenMembershipRegister}
                className='self-start'
              >
                {t('membership.explorePlans')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4 pb-5'>
            <MembershipPlansGrid
              memberships={sortedMemberships}
              onPlanSelect={handleMembershipPlanSelect}
            />

            <Alert className='border-primary/20 bg-primary/5'>
              <TrendingUp className='h-4 w-4' />
              <AlertTitle>{t('membership.note.title')}</AlertTitle>
              <AlertDescription>
                {t('membership.note.content')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className='py-0'>
          <CardHeader className='pt-5 pb-3 md:pt-6'>
            <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
              <Crown className='h-5 w-5 text-primary' />
              <span className='break-words'>{t('postTypes.title')}</span>
            </CardTitle>
            <CardDescription className='max-w-4xl leading-relaxed'>
              {t('postTypes.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pb-5'>
            {vipTiersByPrice.length > 0 ? (
              <>
                <div className='hidden items-stretch gap-4 md:grid md:grid-cols-2 xl:grid-cols-4'>
                  {vipTiersByPrice.map((tier, rank) => (
                    <div key={tier.tierId} className='h-full'>
                      {renderVipTierCard(tier, rank)}
                    </div>
                  ))}
                </div>

                <div className='md:hidden'>
                  <Carousel
                    opts={{ align: 'start', loop: false }}
                    className='w-full'
                  >
                    <CarouselContent>
                      {vipTiersByPrice.map((tier, rank) => (
                        <CarouselItem
                          key={tier.tierId}
                          className='flex basis-[88%] sm:basis-[72%]'
                        >
                          {renderVipTierCard(tier, rank)}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              </>
            ) : (
              <Card className='border-dashed py-0'>
                <CardContent className='py-6 text-center'>
                  <Typography variant='muted'>
                    {t('empty.description')}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className='py-0'>
          <CardHeader className='pt-5 pb-3 md:pt-6'>
            <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
              <CheckCircle2 className='h-5 w-5 text-primary' />
              <span className='break-words'>{t('services.title')}</span>
            </CardTitle>
            <CardDescription>{t('services.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 pb-5'>
            <div className='hidden gap-3 md:grid md:grid-cols-3'>
              {['broker', 'push', 'verification'].map((serviceKey, index) => (
                <div
                  key={serviceKey}
                  className={cn(
                    'rounded-xl border p-4',
                    index === 0 && 'bg-primary/5 border-primary/20',
                    index === 1 && 'bg-accent/30 border-border',
                    index === 2 && 'bg-muted/30 border-border',
                  )}
                >
                  <div className='mb-2 flex items-center gap-2 font-semibold'>
                    <CheckCircle2 className='h-4 w-4 text-primary' />
                    {t(`services.${serviceKey}.name`)}
                  </div>
                  <div className='text-sm leading-relaxed text-muted-foreground'>
                    {t(`services.${serviceKey}.description`)}
                  </div>
                  <div className='mt-3'>
                    <Badge variant='outline'>
                      {t(`services.${serviceKey}.price`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className='md:hidden'>
              <Carousel
                opts={{ align: 'start', loop: false }}
                className='w-full'
              >
                <CarouselContent>
                  {['broker', 'push', 'verification'].map(
                    (serviceKey, index) => (
                      <CarouselItem
                        key={serviceKey}
                        className='basis-[88%] sm:basis-[72%]'
                      >
                        <div
                          className={cn(
                            'rounded-xl border p-4',
                            index === 0 && 'bg-primary/5 border-primary/20',
                            index === 1 && 'bg-accent/30 border-border',
                            index === 2 && 'bg-muted/30 border-border',
                          )}
                        >
                          <div className='mb-2 flex items-center gap-2 font-semibold'>
                            <CheckCircle2 className='h-4 w-4 text-primary' />
                            <span className='break-words'>
                              {t(`services.${serviceKey}.name`)}
                            </span>
                          </div>
                          <div className='text-sm leading-relaxed text-muted-foreground'>
                            {t(`services.${serviceKey}.description`)}
                          </div>
                          <div className='mt-3'>
                            <Badge variant='outline'>
                              {t(`services.${serviceKey}.price`)}
                            </Badge>
                          </div>
                        </div>
                      </CarouselItem>
                    ),
                  )}
                </CarouselContent>
              </Carousel>
            </div>
          </CardContent>
        </Card>
      </section>

      {!memberships.length && !vipTiersByPrice.length && (
        <Card className='border-dashed py-0'>
          <CardContent className='flex flex-col items-center gap-2 py-8 text-center'>
            <AlertCircle className='h-8 w-8 text-muted-foreground' />
            <Typography variant='h5'>{t('empty.title')}</Typography>
            <Typography variant='muted'>{t('empty.description')}</Typography>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PricingGuideTemplate
