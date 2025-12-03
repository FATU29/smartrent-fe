import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { useVipTiers } from '@/hooks/useVipTiers'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuthStore } from '@/store/auth/index.store'
import type { UserBenefit } from '@/api/types/membership.type'
import type { DurationDays, VipType } from '@/api/types/property.type'
import { Button } from '@/components/atoms/button'
import { DatePicker } from '@/components/atoms'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/atoms/card'
import { Label } from '@/components/atoms/label'
import { Typography } from '@/components/atoms/typography'
import { Switch } from '@/components/atoms/switch'
import {
  Calendar,
  Tag,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SelectBenefitDialog } from '@/components/molecules/createPostSections/SelectPromotionDialog'

interface PackageConfigSectionProps {
  className?: string
}

interface DurationOption {
  days: number
  price: number
}

const TIER_ICONS: Record<string, string> = {
  NORMAL: '📄',
  SILVER: '🥈',
  GOLD: '🥇',
  DIAMOND: '💎',
}

const TIER_BACKGROUNDS: Record<string, string> = {
  NORMAL: 'bg-gradient-to-br from-gray-400 to-gray-600',
  SILVER: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  GOLD: 'bg-gradient-to-br from-yellow-400 to-orange-500',
  DIAMOND: 'bg-gradient-to-br from-purple-500 to-pink-500',
}

const PackageConfigSection: React.FC<PackageConfigSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.packageConfig')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()
  const { setValue, trigger } = useFormContext()
  const { user } = useAuthStore()

  const { data: vipTiers = [], isLoading, isError, error } = useVipTiers()

  const userId = useMemo(() => user?.userId, [user?.userId])
  const { data: membership, isLoading: isMembershipLoading } =
    useMyMembership(userId)

  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false)

  const useMembershipQuota = propertyInfo?.useMembershipQuota ?? false

  const hasBenefits =
    !!propertyInfo?.benefitIds && propertyInfo.benefitIds.length > 0
  const useMembership = useMembershipQuota || hasBenefits

  const selectedTier = useMemo(
    () => vipTiers.find((t) => t.tierCode === propertyInfo.vipType),
    [vipTiers, propertyInfo.vipType],
  )
  const selectedDuration = propertyInfo.durationDays ?? 10

  const startDate = useMemo(() => {
    if (!propertyInfo.postDate) return new Date().toISOString().split('T')[0]
    return typeof propertyInfo.postDate === 'string'
      ? propertyInfo.postDate.split('T')[0]
      : new Date(propertyInfo.postDate).toISOString().split('T')[0]
  }, [propertyInfo.postDate])

  // Initialize default values
  useEffect(() => {
    if (vipTiers.length > 0 && !propertyInfo.vipType) {
      const firstTier = vipTiers[0]
      const defaultStartDate = new Date().toISOString().split('T')[0]

      const defaultDuration = useMembershipQuota ? 30 : 10

      const startDateObj = new Date(defaultStartDate)
      const expiryDateObj = new Date(
        startDateObj.getTime() + defaultDuration * 24 * 60 * 60 * 1000,
      )
      const defaultExpiryDate = expiryDateObj.toISOString()

      updatePropertyInfo({
        vipType: firstTier.tierCode as VipType,
        durationDays: defaultDuration,
        postDate: defaultStartDate,
        expiryDate: defaultExpiryDate,
      })

      setValue('vipType', firstTier.tierCode, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('durationDays', defaultDuration, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('postDate', defaultStartDate, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('expiryDate', defaultExpiryDate, {
        shouldValidate: true,
        shouldDirty: true,
      })
      trigger()
    }
  }, [
    vipTiers,
    propertyInfo.vipType,
    updatePropertyInfo,
    setValue,
    trigger,
    useMembershipQuota,
  ])

  const durationOptions = useMemo((): DurationOption[] => {
    if (!selectedTier) return []
    return [
      { days: 10, price: selectedTier.price10Days },
      { days: 15, price: selectedTier.price15Days },
      { days: 30, price: selectedTier.price30Days },
    ]
  }, [selectedTier])

  const totalPrice = useMemo(() => {
    if (useMembership) return 0
    const option = durationOptions.find((d) => d.days === selectedDuration)
    return option?.price || 0
  }, [useMembership, durationOptions, selectedDuration])

  const handleTierSelect = useCallback(
    (tierId: number) => {
      const tier = vipTiers.find((t) => t.tierId === tierId)
      if (!tier) return

      // Calculate expiry date with 10 days default duration
      const startDateObj = new Date(startDate)
      const expiryDateObj = new Date(
        startDateObj.getTime() + 10 * 24 * 60 * 60 * 1000,
      )
      const expiryDate = expiryDateObj.toISOString()

      updatePropertyInfo({
        vipType: tier.tierCode as VipType,
        durationDays: 10,
        expiryDate,
      })

      setValue('vipType', tier.tierCode, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('durationDays', 10, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('expiryDate', expiryDate, {
        shouldValidate: true,
        shouldDirty: true,
      })
      trigger()
    },
    [vipTiers, updatePropertyInfo, setValue, trigger, startDate],
  )

  const handleDurationSelect = useCallback(
    (days: number) => {
      // Calculate new expiry date with the new duration
      const startDateObj = new Date(startDate)
      const expiryDateObj = new Date(
        startDateObj.getTime() + days * 24 * 60 * 60 * 1000,
      )
      const expiryDate = expiryDateObj.toISOString()

      updatePropertyInfo({
        durationDays: days as DurationDays,
        expiryDate,
      })
      setValue('durationDays', days, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('expiryDate', expiryDate, {
        shouldValidate: true,
        shouldDirty: true,
      })
      trigger()
    },
    [updatePropertyInfo, setValue, trigger, startDate],
  )

  const handleDateChange = useCallback(
    (date?: string) => {
      const newStart = date || new Date().toISOString().split('T')[0]
      const fullDate = new Date(newStart).toISOString()

      // Calculate expiry date based on start date + duration
      const startDateObj = new Date(newStart)
      const expiryDateObj = new Date(
        startDateObj.getTime() + selectedDuration * 24 * 60 * 60 * 1000,
      )
      const expiryDate = expiryDateObj.toISOString()

      updatePropertyInfo({ postDate: fullDate, expiryDate })
      setValue('postDate', fullDate, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('expiryDate', expiryDate, {
        shouldValidate: true,
        shouldDirty: true,
      })
      trigger()
    },
    [updatePropertyInfo, setValue, trigger, selectedDuration],
  )

  const handleToggleMembershipQuota = useCallback(
    (checked: boolean) => {
      const newDuration = checked ? 30 : 10

      // Calculate new expiry date
      const startDateObj = new Date(startDate)
      const expiryDateObj = new Date(
        startDateObj.getTime() + newDuration * 24 * 60 * 60 * 1000,
      )
      const expiryDate = expiryDateObj.toISOString()

      updatePropertyInfo({
        useMembershipQuota: checked,
        durationDays: newDuration,
        expiryDate,
      })

      setValue('useMembershipQuota', checked, { shouldDirty: true })
      setValue('durationDays', newDuration, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('expiryDate', expiryDate, {
        shouldValidate: true,
        shouldDirty: true,
      })

      if (!checked && hasBenefits) {
        updatePropertyInfo({ benefitIds: [] })
        setValue('benefitIds', [], { shouldDirty: true })
      }
      trigger()
    },
    [updatePropertyInfo, setValue, trigger, startDate, hasBenefits],
  )

  const handleApplyBenefits = useCallback(
    (benefits: UserBenefit[]) => {
      const benefitIds = benefits.map((b) => b.userBenefitId)

      // Calculate expiry date with 30 days duration when applying benefits
      const startDateObj = new Date(startDate)
      const expiryDateObj = new Date(
        startDateObj.getTime() + 30 * 24 * 60 * 60 * 1000,
      )
      const expiryDate = expiryDateObj.toISOString()

      // Selecting benefits implicitly enables quota-like behavior
      updatePropertyInfo({
        benefitIds,
        useMembershipQuota: benefitIds.length > 0,
        durationDays:
          benefitIds.length > 0 ? 30 : (propertyInfo.durationDays ?? 10),
        expiryDate:
          benefitIds.length > 0 ? expiryDate : propertyInfo.expiryDate,
      })
      setValue('benefitIds', benefitIds, { shouldDirty: true })
      setValue('useMembershipQuota', benefitIds.length > 0, {
        shouldDirty: true,
      })
      if (benefitIds.length > 0) {
        setValue('durationDays', 30, {
          shouldValidate: true,
          shouldDirty: true,
        })
        setValue('expiryDate', expiryDate, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    },
    [
      updatePropertyInfo,
      setValue,
      propertyInfo.durationDays,
      propertyInfo.expiryDate,
      startDate,
    ],
  )

  if (isLoading) {
    return (
      <Card className={cn('border-0 shadow-none', className)}>
        <CardContent className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className={cn('border-0 shadow-none', className)}>
        <CardContent className='flex flex-col items-center justify-center py-12 gap-4'>
          <AlertCircle className='w-12 h-12 text-destructive' />
          <Typography variant='muted' className='text-center'>
            {error instanceof Error
              ? error.message
              : 'Failed to load VIP tiers'}
          </Typography>
          <Button variant='outline' onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-0 shadow-none', className)}>
      <CardHeader className='px-0'>
        <CardTitle className='text-2xl sm:text-3xl lg:text-4xl'>
          {t('title')}
        </CardTitle>
        <CardDescription className='text-sm sm:text-base'>
          {t('description')}
        </CardDescription>
      </CardHeader>

      <CardContent className='px-0 space-y-6'>
        {/* Use Membership Quota Toggle */}
        <Card className='p-6'>
          <CardContent className='flex items-center justify-between gap-4 p-0'>
            <div>
              <Typography className='font-medium text-sm'>
                {t('useMembershipQuota')}
              </Typography>
              <Typography variant='muted' className='text-xs'>
                {t('useMembershipQuotaDescription')}
              </Typography>
            </div>
            <Switch
              checked={useMembership}
              onCheckedChange={handleToggleMembershipQuota}
            />
          </CardContent>
        </Card>

        {/* Package Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>{t('selectPackageType')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {vipTiers.map((tier) => (
              <Button
                key={tier.tierId}
                variant='outline'
                onClick={() => handleTierSelect(tier.tierId)}
                disabled={useMembership}
                className={cn(
                  'relative h-auto p-5 text-left transition-all hover:shadow-lg flex-col items-center sm:items-start',
                  selectedTier?.tierId === tier.tierId &&
                    'border-primary bg-primary/5 shadow-md',
                  useMembership && 'opacity-50 cursor-not-allowed',
                )}
              >
                <Card
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 border-0',
                    TIER_BACKGROUNDS[tier.tierCode] || TIER_BACKGROUNDS.NORMAL,
                  )}
                >
                  <Typography as='span'>
                    {TIER_ICONS[tier.tierCode] || TIER_ICONS.NORMAL}
                  </Typography>
                </Card>
                <Typography
                  variant='h4'
                  className='font-bold text-base mb-1 text-center sm:text-left break-words w-full'
                >
                  {tier.tierName}
                </Typography>
                <Typography
                  variant='muted'
                  className='text-xs mb-3 text-center sm:text-left break-words w-full'
                >
                  {tier.tierNameEn}
                </Typography>
                <Typography className='font-bold text-lg mt-auto text-center sm:text-left w-full break-words'>
                  {tier.pricePerDay.toLocaleString('vi-VN')} đ/{t('perDay')}
                </Typography>
                {selectedTier?.tierId === tier.tierId && (
                  <Card className='absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-0 p-0'>
                    <Check className='w-4 h-4 text-primary-foreground' />
                  </Card>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Duration Selection */}
        <Card className='bg-muted/50'>
          <CardHeader>
            <CardTitle className='text-base'>{t('selectDuration')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {durationOptions.map((option) => (
              <Button
                key={option.days}
                variant='outline'
                onClick={() => handleDurationSelect(option.days)}
                disabled={useMembership}
                className={cn(
                  'relative h-auto p-4 text-left transition-all',
                  selectedDuration === option.days &&
                    'border-primary bg-primary/5',
                  useMembership && 'opacity-50 cursor-not-allowed',
                )}
              >
                <Card className='flex items-center justify-between w-full border-0 shadow-none p-0 bg-transparent'>
                  <CardContent className='p-0'>
                    <Typography className='font-bold text-lg'>
                      {option.days} {t('days')}
                    </Typography>
                    <Typography variant='muted' className='text-sm'>
                      {useMembership
                        ? t('freePosting')
                        : `${option.price.toLocaleString('vi-VN')} đ`}
                    </Typography>
                  </CardContent>
                  <Card
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center p-0',
                      selectedDuration === option.days
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30 bg-transparent',
                    )}
                  >
                    {selectedDuration === option.days && (
                      <Card className='w-3 h-3 rounded-full bg-primary-foreground border-0 p-0' />
                    )}
                  </Card>
                </Card>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card className='grid grid-cols-1 sm:grid-cols-2 gap-6 p-6'>
          <CardContent className='space-y-2 p-0'>
            <Label className='text-sm font-medium flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              {t('startDate')}
            </Label>
            <DatePicker
              value={startDate}
              onChange={handleDateChange}
              placeholder={t('selectStartDate')}
            />
            {startDate && (
              <Typography variant='muted' className='text-xs'>
                {t('endDate')}:{' '}
                {new Date(
                  new Date(startDate).getTime() +
                    selectedDuration * 24 * 60 * 60 * 1000,
                ).toLocaleDateString('vi-VN')}
              </Typography>
            )}
          </CardContent>

          <CardContent className='space-y-2 p-0'>
            <Label className='text-sm font-medium flex items-center gap-2'>
              <Tag className='w-4 h-4' />
              {t('promotionCode')}
            </Label>
            <Button
              variant='link'
              className='text-sm text-primary hover:underline p-0 h-auto flex items-center gap-1'
              onClick={() => setBenefitDialogOpen(true)}
              disabled={isMembershipLoading || !membership}
            >
              {t('usePromotion')}
              <ChevronRight className='w-4 h-4' />
            </Button>
            {propertyInfo.benefitIds && propertyInfo.benefitIds.length > 0 && (
              <Typography variant='muted' className='text-xs'>
                {t('promotionApplied')}: {propertyInfo.benefitIds.length}{' '}
                {propertyInfo.benefitIds.length > 1 ? 'benefits' : 'benefit'}
              </Typography>
            )}
            {!membership && !isMembershipLoading && (
              <Typography variant='muted' className='text-xs text-orange-600'>
                Bạn chưa có gói hội viên
              </Typography>
            )}
          </CardContent>
        </Card>

        <SelectBenefitDialog
          open={benefitDialogOpen}
          onOpenChange={setBenefitDialogOpen}
          onApply={handleApplyBenefits}
          membershipData={membership}
        />

        {/* Summary */}
        <Card className='flex flex-col lg:flex-row gap-6 p-6'>
          <Card className='flex-1 space-y-3 border-0 shadow-none p-0'>
            <Card className='flex justify-between border-0 shadow-none p-0'>
              <Typography variant='muted' className='text-sm'>
                {t('selectedPackage')}:
              </Typography>
              <Typography className='font-medium text-sm'>
                {selectedTier?.tierName}
              </Typography>
            </Card>
            <Card className='flex justify-between border-0 shadow-none p-0'>
              <Typography variant='muted' className='text-sm'>
                {t('duration')}:
              </Typography>
              <Typography className='font-medium text-sm'>
                {selectedDuration} {t('days')}
              </Typography>
            </Card>
            {useMembership && (
              <Card className='flex justify-between border-0 shadow-none p-0'>
                <Typography variant='muted' className='text-sm'>
                  {t('usingMembershipQuota')}:
                </Typography>
                <Typography className='font-medium text-sm text-green-600'>
                  {t('freePosting')}
                </Typography>
              </Card>
            )}
          </Card>

          <Card className='lg:w-[280px] flex flex-col justify-center items-end max-md:items-start border-0 shadow-none p-0'>
            <Typography className='text-base font-semibold mb-2'>
              {t('totalAmount')}
            </Typography>
            <Typography
              className={cn(
                'text-3xl font-bold',
                useMembership ? 'text-green-600' : 'text-primary',
              )}
            >
              {useMembership
                ? t('freePosting')
                : `${totalPrice.toLocaleString('vi-VN')} đ`}
            </Typography>
            {!useMembership && (
              <Typography variant='muted' className='text-xs mt-1'>
                {t('vatIncluded')}
              </Typography>
            )}
          </Card>
        </Card>
      </CardContent>
    </Card>
  )
}

export { PackageConfigSection }
export type { PackageConfigSectionProps }
