import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
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
import { Skeleton } from '@/components/atoms/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table'
import { Typography } from '@/components/atoms/typography'
import type {
  Membership,
  MembershipPackageLevel,
} from '@/api/types/membership.type'
import { useMembershipPackages } from '@/hooks/useMembership'
import { useVipTiers } from '@/hooks/useVipTiers'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'
import { cn } from '@/lib/utils'

const LISTING_TYPE_STYLES: Record<
  'DIAMOND' | 'GOLD' | 'SILVER' | 'STANDARD',
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

const BENEFIT_KEYS = {
  gold: 'POST_GOLD',
  silver: 'POST_SILVER',
  normal: 'POST_STANDARD',
} as const

const MEMBERSHIP_ORDER: Record<MembershipPackageLevel, number> = {
  BASIC: 1,
  STANDARD: 2,
  ADVANCED: 3,
}

const normalizeTierCode = (tierCode?: string) =>
  (tierCode || 'NORMAL').toUpperCase()

const LISTING_TYPE_ORDER = ['DIAMOND', 'GOLD', 'SILVER', 'STANDARD'] as const

const getTierPriorityTranslationKey = (tierCode: string) => {
  switch (normalizeTierCode(tierCode)) {
    case 'DIAMOND':
      return 'highest'
    case 'GOLD':
      return 'highest'
    case 'SILVER':
      return 'high'
    case 'NORMAL':
    default:
      return 'normal'
  }
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(price)

  const sortedMemberships = [...memberships].sort((a, b) => {
    const aOrder =
      MEMBERSHIP_ORDER[a.packageLevel as MembershipPackageLevel] || 99
    const bOrder =
      MEMBERSHIP_ORDER[b.packageLevel as MembershipPackageLevel] || 99
    return aOrder - bOrder
  })

  const sortedVipTiers = [...vipTiers].sort((a, b) => a.tierLevel - b.tierLevel)

  const vipTierLookup = React.useMemo(() => {
    return new Map(
      sortedVipTiers.map((tier) => [normalizeTierCode(tier.tierCode), tier]),
    )
  }, [sortedVipTiers])

  const getBenefitQuantity = (membership: Membership, benefitType: string) => {
    const benefit = membership.benefits.find(
      (item) => item.benefitType === benefitType,
    )
    return benefit?.quantityPerMonth || 0
  }

  const getTierPricePerDay = (tierCode: string) => {
    const tier = vipTierLookup.get(normalizeTierCode(tierCode))
    return tier?.pricePerDay || 0
  }

  const priceRange = sortedVipTiers.length
    ? {
        min: Math.min(...sortedVipTiers.map((tier) => tier.pricePerDay || 0)),
        max: Math.max(...sortedVipTiers.map((tier) => tier.pricePerDay || 0)),
      }
    : { min: 0, max: 0 }

  const membershipStats = {
    packages: sortedMemberships.length,
    listingTypes: LISTING_TYPE_ORDER.length,
    maxListing: sortedMemberships.reduce((max, membership) => {
      const total =
        getBenefitQuantity(membership, BENEFIT_KEYS.gold) +
        getBenefitQuantity(membership, BENEFIT_KEYS.silver) +
        getBenefitQuantity(membership, BENEFIT_KEYS.normal)
      return Math.max(max, total)
    }, 0),
    priceRange: {
      min: sortedMemberships.length
        ? Math.min(...sortedMemberships.map((item) => item.salePrice))
        : 0,
      max: sortedMemberships.length
        ? Math.max(...sortedMemberships.map((item) => item.salePrice))
        : 0,
    },
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

      <Tabs defaultValue='membership' className='space-y-5'>
        <TabsList className='h-auto flex-wrap justify-start gap-2 rounded-xl border bg-background p-1'>
          <TabsTrigger value='membership'>{t('tabs.membership')}</TabsTrigger>
          <TabsTrigger value='tiers'>{t('tabs.postTypes')}</TabsTrigger>
          <TabsTrigger value='services'>{t('tabs.services')}</TabsTrigger>
        </TabsList>

        <TabsContent value='membership' className='mt-0'>
          <Card className='py-0'>
            <CardHeader className='pt-5 pb-3 md:pt-6'>
              <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                <BadgeCheck className='h-5 w-5 text-primary' />
                <span className='break-words'>{t('membership.title')}</span>
              </CardTitle>
              <CardDescription>{t('membership.description')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 pb-5'>
              <div className='overflow-hidden rounded-xl border bg-background'>
                <Table aria-label={t('membership.table.ariaLabel')}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('membership.table.columns.package')}
                      </TableHead>
                      <TableHead>
                        {t('membership.table.columns.monthlyPrice')}
                      </TableHead>
                      <TableHead>
                        {t('membership.table.columns.gold')}
                      </TableHead>
                      <TableHead>
                        {t('membership.table.columns.silver')}
                      </TableHead>
                      <TableHead>
                        {t('membership.table.columns.normal')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMemberships.map((membership) => {
                      const isRecommended =
                        membership.packageLevel === 'STANDARD'
                      return (
                        <TableRow
                          key={membership.membershipId}
                          className={cn(
                            isRecommended ? 'font-medium' : undefined,
                          )}
                        >
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold'>
                                {membership.packageName}
                              </span>
                              {isRecommended && (
                                <Badge variant='outline'>
                                  {t('membership.plans.popular')}
                                </Badge>
                              )}
                            </div>
                            {membership.description && (
                              <div className='mt-1 text-xs text-muted-foreground'>
                                {membership.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className='font-semibold'>
                              {formatPrice(membership.salePrice)}{' '}
                              {t('currencySymbol')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getBenefitQuantity(membership, BENEFIT_KEYS.gold)}
                          </TableCell>
                          <TableCell>
                            {getBenefitQuantity(
                              membership,
                              BENEFIT_KEYS.silver,
                            )}
                          </TableCell>
                          <TableCell>
                            {getBenefitQuantity(
                              membership,
                              BENEFIT_KEYS.normal,
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className='grid gap-4 md:grid-cols-3'>
                {sortedMemberships.map((membership) => {
                  const isRecommended = membership.packageLevel === 'STANDARD'
                  const totalPosts =
                    getBenefitQuantity(membership, BENEFIT_KEYS.gold) +
                    getBenefitQuantity(membership, BENEFIT_KEYS.silver) +
                    getBenefitQuantity(membership, BENEFIT_KEYS.normal)
                  return (
                    <div
                      key={membership.membershipId}
                      className={cn(
                        'rounded-xl border bg-card p-4',
                        isRecommended &&
                          'border-foreground/20 ring-1 ring-border',
                      )}
                    >
                      <div className='mb-3 flex items-start justify-between gap-2'>
                        <div>
                          <div className='mb-1 text-base font-semibold leading-snug sm:text-lg'>
                            {membership.packageName}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {t('membership.card.totalPosts')}: {totalPosts}
                          </div>
                        </div>
                        {membership.discountPercentage > 0 && (
                          <Badge variant='secondary'>
                            -{membership.discountPercentage}%
                          </Badge>
                        )}
                      </div>
                      <div className='mb-3 text-lg font-bold text-foreground sm:text-xl'>
                        {formatPrice(membership.salePrice)}{' '}
                        {t('currencySymbol')}
                        <span className='ml-1 text-sm font-medium text-muted-foreground'>
                          / {t('membership.card.perMonth')}
                        </span>
                      </div>
                      <div className='space-y-1 text-sm text-muted-foreground'>
                        <div>
                          {t('membership.table.columns.gold')}:{' '}
                          {getBenefitQuantity(membership, BENEFIT_KEYS.gold)}
                        </div>
                        <div>
                          {t('membership.table.columns.silver')}:{' '}
                          {getBenefitQuantity(membership, BENEFIT_KEYS.silver)}
                        </div>
                        <div>
                          {t('membership.table.columns.normal')}:{' '}
                          {getBenefitQuantity(membership, BENEFIT_KEYS.normal)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Alert className='border-primary/20 bg-primary/5'>
                <TrendingUp className='h-4 w-4' />
                <AlertTitle>{t('membership.note.title')}</AlertTitle>
                <AlertDescription>
                  {t('membership.note.content')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='tiers' className='mt-0'>
          <Card className='py-0'>
            <CardHeader className='pt-5 pb-3 md:pt-6'>
              <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
                <Crown className='h-5 w-5 text-primary' />
                <span className='break-words'>{t('postTypes.title')}</span>
              </CardTitle>
              <CardDescription>{t('postTypes.description')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 pb-5'>
              <Typography variant='small' className='text-muted-foreground'>
                {t('postTypes.referenceNote')}
              </Typography>

              <div className='hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4'>
                {LISTING_TYPE_ORDER.map((tierCode) => {
                  const normalizedTierCode = normalizeTierCode(tierCode)
                  const style =
                    LISTING_TYPE_STYLES[
                      normalizedTierCode as keyof typeof LISTING_TYPE_STYLES
                    ]
                  const translationKey =
                    getListingTypeTranslationKey(normalizedTierCode)
                  const tier = vipTierLookup.get(normalizedTierCode)
                  const pricePerDay = tier
                    ? getTierPricePerDay(normalizedTierCode)
                    : 0

                  return (
                    <div
                      key={tierCode}
                      className={cn('rounded-xl border p-4', style.cardClass)}
                    >
                      <div className='mb-2 flex items-start justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <Crown className={cn('h-4 w-4', style.iconClass)} />
                          <div
                            className={cn(
                              'text-lg font-semibold',
                              style.titleClass,
                            )}
                          >
                            {t(`postTypes.${translationKey}.name`)}
                          </div>
                        </div>
                        <Badge variant='outline' className={style.badgeClass}>
                          {t(
                            `postTypes.priority.${getTierPriorityTranslationKey(normalizedTierCode)}`,
                          )}
                        </Badge>
                      </div>

                      <div className='mb-4 text-sm leading-relaxed text-muted-foreground'>
                        {t(`postTypes.${translationKey}.description`)}
                      </div>

                      <div className='space-y-2 text-sm'>
                        <div className='flex items-start justify-between gap-3 rounded-md border bg-background/70 px-3 py-2'>
                          <span className='text-muted-foreground'>
                            {t('postTypes.price')}
                          </span>
                          <span className='text-right font-semibold'>
                            {tier
                              ? `${formatPrice(pricePerDay)} ${t('currencySymbol')}`
                              : t(`postTypes.${translationKey}.price`)}
                          </span>
                        </div>
                        <div className='flex items-start justify-between gap-3 rounded-md border bg-background/70 px-3 py-2'>
                          <span className='text-muted-foreground'>
                            {t('postTypes.maxImages')}
                          </span>
                          <span className='text-right font-semibold'>
                            {tier
                              ? tier.maxImages
                              : t(`postTypes.${translationKey}.maxImages`)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className='md:hidden'>
                <Carousel
                  opts={{ align: 'start', loop: false }}
                  className='w-full'
                >
                  <CarouselContent>
                    {LISTING_TYPE_ORDER.map((tierCode) => {
                      const normalizedTierCode = normalizeTierCode(tierCode)
                      const style =
                        LISTING_TYPE_STYLES[
                          normalizedTierCode as keyof typeof LISTING_TYPE_STYLES
                        ]
                      const translationKey =
                        getListingTypeTranslationKey(normalizedTierCode)
                      const tier = vipTierLookup.get(normalizedTierCode)
                      const pricePerDay = tier
                        ? getTierPricePerDay(normalizedTierCode)
                        : 0

                      return (
                        <CarouselItem
                          key={tierCode}
                          className='basis-[88%] sm:basis-[72%]'
                        >
                          <div
                            className={cn(
                              'rounded-xl border p-4',
                              style.cardClass,
                            )}
                          >
                            <div className='mb-2 flex items-start justify-between gap-2'>
                              <div className='flex items-center gap-2'>
                                <Crown
                                  className={cn('h-4 w-4', style.iconClass)}
                                />
                                <div
                                  className={cn(
                                    'text-base font-semibold leading-snug',
                                    style.titleClass,
                                  )}
                                >
                                  {t(`postTypes.${translationKey}.name`)}
                                </div>
                              </div>
                              <Badge
                                variant='outline'
                                className={style.badgeClass}
                              >
                                {t(
                                  `postTypes.priority.${getTierPriorityTranslationKey(normalizedTierCode)}`,
                                )}
                              </Badge>
                            </div>

                            <div className='mb-4 text-sm leading-relaxed text-muted-foreground'>
                              {t(`postTypes.${translationKey}.description`)}
                            </div>

                            <div className='space-y-2 text-sm'>
                              <div className='flex items-start justify-between gap-3 rounded-md border bg-background/70 px-3 py-2'>
                                <span className='text-muted-foreground'>
                                  {t('postTypes.price')}
                                </span>
                                <span className='text-right font-semibold'>
                                  {tier
                                    ? `${formatPrice(pricePerDay)} ${t('currencySymbol')}`
                                    : t(`postTypes.${translationKey}.price`)}
                                </span>
                              </div>
                              <div className='flex items-start justify-between gap-3 rounded-md border bg-background/70 px-3 py-2'>
                                <span className='text-muted-foreground'>
                                  {t('postTypes.maxImages')}
                                </span>
                                <span className='text-right font-semibold'>
                                  {tier
                                    ? tier.maxImages
                                    : t(
                                        `postTypes.${translationKey}.maxImages`,
                                      )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                </Carousel>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='services' className='mt-0'>
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
        </TabsContent>
      </Tabs>

      {!memberships.length && !vipTiers.length && (
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
