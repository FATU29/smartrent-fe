import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { useVipTiers } from '@/hooks/useVipTiers'
import type { VipTier } from '@/api/types/vip-tier.type'
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
import {
  Calendar,
  Tag,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SelectPromotionDialog } from '@/components/molecules/createPostSections/SelectPromotionDialog'
import type { BenefitType, UserBenefit } from '@/api/types/memembership.type'

interface PackageConfigSectionProps {
  className?: string
}

interface DurationOption {
  days: number
  price: number
}

const PackageConfigSection: React.FC<PackageConfigSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.packageConfig')
  const { updatePropertyInfo } = useCreatePost()

  // Fetch VIP tiers using React Query
  const { data: vipTiers = [], isLoading, isError, error } = useVipTiers()

  const [selectedTierId, setSelectedTierId] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(10)
  const [startDate, setStartDate] = useState<string>('')
  const [promoOpen, setPromoOpen] = useState(false)

  // Auto-select first tier when data loads
  useEffect(() => {
    if (vipTiers.length > 0 && selectedTierId === null) {
      const firstTier = vipTiers[0]
      setSelectedTierId(firstTier.tierId)
      updatePropertyInfo({
        selectedPackageType: firstTier.tierCode,
        selectedTierId: firstTier.tierId,
        selectedDuration: 10,
        packageStartDate: startDate,
      })
    }
  }, [vipTiers, selectedTierId, updatePropertyInfo, startDate])

  const selectedTier = vipTiers.find((t) => t.tierId === selectedTierId)

  // Get duration options for selected tier
  const getDurationOptions = (tier: VipTier | undefined): DurationOption[] => {
    if (!tier) return []
    return [
      { days: 10, price: tier.price10Days },
      { days: 15, price: tier.price15Days },
      { days: 30, price: tier.price30Days },
    ]
  }

  const durationOptions = getDurationOptions(selectedTier)
  const selectedDurationOption = durationOptions.find(
    (d) => d.days === selectedDuration,
  )
  const totalPrice = selectedDurationOption?.price || 0

  // Icon mapping for tier codes
  const getTierIcon = (tierCode: string) => {
    const icons: Record<string, string> = {
      NORMAL: '📄',
      SILVER: '🥈',
      GOLD: '🥇',
      DIAMOND: '💎',
    }
    return icons[tierCode] || '📄'
  }

  // Icon background mapping
  const getTierIconBg = (tierCode: string) => {
    const backgrounds: Record<string, string> = {
      NORMAL: 'bg-gradient-to-br from-gray-400 to-gray-600',
      SILVER: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      GOLD: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      DIAMOND: 'bg-gradient-to-br from-purple-500 to-pink-500',
    }
    return (
      backgrounds[tierCode] || 'bg-gradient-to-br from-gray-400 to-gray-600'
    )
  }

  const handleTierSelect = (tierId: number) => {
    setSelectedTierId(tierId)
    // Reset duration to 10 days when switching tiers
    setSelectedDuration(10)
    const tier = vipTiers.find((t) => t.tierId === tierId)
    updatePropertyInfo({
      selectedPackageType: tier?.tierCode,
      selectedTierId: tierId,
      selectedDuration: 10,
      packageStartDate: startDate,
    })
  }

  const handleDurationSelect = (days: number) => {
    setSelectedDuration(days)
    updatePropertyInfo({
      selectedPackageType: selectedTier?.tierCode,
      selectedDuration: days,
      packageStartDate: startDate,
    })
  }

  const mapBenefitToTierCode = (type: BenefitType): string | undefined => {
    switch (type) {
      case 'POST_STANDARD':
        return 'NORMAL'
      case 'POST_SILVER':
        return 'SILVER'
      case 'POST_GOLD':
        return 'GOLD'
      default:
        return undefined
    }
  }

  const handleApplyPromotion = (benefit: UserBenefit) => {
    const tierCode = mapBenefitToTierCode(benefit.benefitType as BenefitType)
    // Try to match vip tier by code to set selectedTierId
    const tier = vipTiers.find((t) => t.tierCode === tierCode)
    if (tier) {
      setSelectedTierId(tier.tierId)
    }
    updatePropertyInfo({
      selectedPackageType: tierCode,
      selectedTierId: tier?.tierId,
      selectedDuration: selectedDuration,
      packageStartDate: startDate,
      appliedPromotionBenefitId: benefit.userBenefitId,
      appliedPromotionType: benefit.benefitType,
      appliedPromotionLabel: benefit.benefitNameDisplay,
    })
  }

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
                className={cn(
                  'relative h-auto p-5 text-left transition-all hover:shadow-lg flex-col items-center sm:items-start',
                  selectedTierId === tier.tierId &&
                    'border-primary bg-primary/5 shadow-md',
                )}
              >
                <Card
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 border-0',
                    getTierIconBg(tier.tierCode),
                  )}
                >
                  <Typography as='span'>
                    {getTierIcon(tier.tierCode)}
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
                {selectedTierId === tier.tierId && (
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
                className={cn(
                  'relative h-auto p-4 text-left transition-all',
                  selectedDuration === option.days &&
                    'border-primary bg-primary/5',
                )}
              >
                <Card className='flex items-center justify-between w-full border-0 shadow-none p-0 bg-transparent'>
                  <CardContent className='p-0'>
                    <Typography className='font-bold text-lg'>
                      {option.days} {t('days')}
                    </Typography>
                    <Typography variant='muted' className='text-sm'>
                      {option.price.toLocaleString('vi-VN')} đ
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
            <Label className='text-sm font-medium'>
              <Calendar className='w-4 h-4' />
              {t('startDate')}
            </Label>
            <DatePicker
              value={startDate}
              onChange={(date) => {
                setStartDate(date || '')
                updatePropertyInfo({ packageStartDate: date || '' })
              }}
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
            <Label className='text-sm font-medium'>
              <Tag className='w-4 h-4' />
              {t('promotionCode')}
            </Label>
            <Button
              variant='link'
              className='text-sm text-primary hover:underline p-0 h-auto flex items-center gap-1'
              onClick={() => setPromoOpen(true)}
            >
              {t('usePromotion')}
              <ChevronRight className='w-4 h-4' />
            </Button>
          </CardContent>
        </Card>
        <SelectPromotionDialog
          open={promoOpen}
          onOpenChange={setPromoOpen}
          onApply={handleApplyPromotion}
        />

        {/* Summary - Flex Layout */}
        <Card className='flex flex-col lg:flex-row gap-6 p-6'>
          {/* Left Side - Package and Duration Info */}
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
          </Card>

          {/* Right Side - Total Price */}
          <Card className='lg:w-[280px] flex flex-col justify-center items-end max-md:items-start border-0 shadow-none p-0'>
            <Typography className='text-base font-semibold mb-2'>
              {t('totalAmount')}
            </Typography>
            <Typography className='text-3xl font-bold text-primary'>
              {totalPrice.toLocaleString('vi-VN')} đ
            </Typography>
            <Typography variant='muted' className='text-xs mt-1'>
              {t('vatIncluded')}
            </Typography>
          </Card>
        </Card>
      </CardContent>
    </Card>
  )
}

export { PackageConfigSection }
export type { PackageConfigSectionProps }
