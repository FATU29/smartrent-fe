import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Typography } from '@/components/atoms/typography'
import { Calendar, Tag, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PackageConfigSectionProps {
  className?: string
}

interface PackageType {
  id: string
  name: string
  description: string
  pricePerDay: number
  icon: string
  iconBg: string
}

interface DurationOption {
  days: number
  pricePerDay: number
}

const PackageConfigSection: React.FC<PackageConfigSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.packageConfig')
  const { updatePropertyInfo } = useCreatePost()

  const [selectedPackageId, setSelectedPackageId] = useState<string>('standard')
  const [selectedDuration, setSelectedDuration] = useState<number>(10)
  const [startDate, setStartDate] = useState<string>('')

  const packageTypes: PackageType[] = [
    {
      id: 'vip-diamond',
      name: t('packages.vipDiamond.name'),
      description: t('packages.vipDiamond.description'),
      pricePerDay: 280000,
      icon: '💎',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    },
    {
      id: 'vip-gold',
      name: t('packages.vipGold.name'),
      description: t('packages.vipGold.description'),
      pricePerDay: 110000,
      icon: '🥇',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    },
    {
      id: 'vip-silver',
      name: t('packages.vipSilver.name'),
      description: t('packages.vipSilver.description'),
      pricePerDay: 50000,
      icon: '🥈',
      iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    },
    {
      id: 'standard',
      name: t('packages.standard.name'),
      description: t('packages.standard.description'),
      pricePerDay: 2700,
      icon: '📄',
      iconBg: 'bg-gradient-to-br from-gray-400 to-gray-600',
    },
  ]

  const durationOptions: DurationOption[] = [
    { days: 10, pricePerDay: 2700 },
    { days: 15, pricePerDay: 2400 },
    { days: 30, pricePerDay: 2200 },
  ]

  const selectedPackage = packageTypes.find((p) => p.id === selectedPackageId)
  const selectedDurationOption = durationOptions.find(
    (d) => d.days === selectedDuration,
  )
  const totalPrice = selectedDurationOption
    ? selectedDurationOption.pricePerDay * selectedDuration
    : 0

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId)
    updatePropertyInfo({
      selectedPackageType: packageId,
      selectedDuration,
      packageStartDate: startDate,
    })
  }

  const handleDurationSelect = (days: number) => {
    setSelectedDuration(days)
    updatePropertyInfo({
      selectedPackageType: selectedPackageId,
      selectedDuration: days,
      packageStartDate: startDate,
    })
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
            {packageTypes.map((pkg) => (
              <Button
                key={pkg.id}
                variant='outline'
                onClick={() => handlePackageSelect(pkg.id)}
                className={cn(
                  'relative h-auto p-5 text-left transition-all hover:shadow-lg flex-col items-center sm:items-start',
                  selectedPackageId === pkg.id &&
                    'border-primary bg-primary/5 shadow-md',
                )}
              >
                <Card
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 border-0',
                    pkg.iconBg,
                  )}
                >
                  <Typography as='span'>{pkg.icon}</Typography>
                </Card>
                <Typography
                  variant='h4'
                  className='font-bold text-base mb-1 text-center sm:text-left break-words w-full'
                >
                  {pkg.name}
                </Typography>
                <Typography
                  variant='muted'
                  className='text-xs mb-3 text-center sm:text-left break-words w-full'
                >
                  {pkg.description}
                </Typography>
                <Typography className='font-bold text-lg mt-auto text-center sm:text-left w-full break-words'>
                  {pkg.pricePerDay.toLocaleString('vi-VN')} đ/{t('perDay')}
                </Typography>
                {selectedPackageId === pkg.id && (
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
                      {option.pricePerDay.toLocaleString('vi-VN')} đ/
                      {t('perDay')}
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
            <Input
              type='date'
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                updatePropertyInfo({ packageStartDate: e.target.value })
              }}
              className='w-full'
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
            <Card className='flex gap-2 border-0 shadow-none p-0'>
              <Input
                type='text'
                placeholder={t('enterPromotionCode')}
                className='flex-1'
              />
              <Button variant='outline' className='px-6'>
                {t('apply')}
              </Button>
            </Card>
            <Button
              variant='link'
              className='text-sm text-primary hover:underline p-0 h-auto flex items-center gap-1'
            >
              {t('usePromotion')}
              <ChevronRight className='w-4 h-4' />
            </Button>
          </CardContent>
        </Card>

        {/* Summary - Flex Layout */}
        <Card className='flex flex-col lg:flex-row gap-6 p-6'>
          {/* Left Side - Package and Duration Info */}
          <Card className='flex-1 space-y-3 border-0 shadow-none p-0'>
            <Card className='flex justify-between border-0 shadow-none p-0'>
              <Typography variant='muted' className='text-sm'>
                {t('selectedPackage')}:
              </Typography>
              <Typography className='font-medium text-sm'>
                {selectedPackage?.name}
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
