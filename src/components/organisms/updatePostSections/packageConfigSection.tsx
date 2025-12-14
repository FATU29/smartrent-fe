import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { useVipTiers } from '@/hooks/useVipTiers'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/atoms/card'
import { Label } from '@/components/atoms/label'
import { Typography } from '@/components/atoms/typography'
import { Input } from '@/components/atoms/input'
import { Calendar, Check, Loader2, AlertCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PackageConfigSectionProps {
  className?: string
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
  const tUpdate = useTranslations(
    'createPost.sections.packageConfig.updatePost',
  )
  const { propertyInfo } = useCreatePost()

  const { data: vipTiers = [], isLoading, isError, error } = useVipTiers()

  // All fields are readonly in UpdatePost
  const selectedTier = useMemo(
    () => vipTiers.find((t) => t.tierCode === propertyInfo.vipType),
    [vipTiers, propertyInfo.vipType],
  )
  const selectedDuration = propertyInfo.durationDays ?? 10

  const startDate = useMemo(() => {
    if (!propertyInfo.postDate) return new Date()
    return typeof propertyInfo.postDate === 'string'
      ? new Date(propertyInfo.postDate)
      : propertyInfo.postDate
  }, [propertyInfo.postDate])

  const endDate = useMemo(() => {
    if (!propertyInfo.expiryDate) {
      // Calculate based on start date + duration
      const start = new Date(startDate)
      return new Date(start.getTime() + selectedDuration * 24 * 60 * 60 * 1000)
    }
    return typeof propertyInfo.expiryDate === 'string'
      ? new Date(propertyInfo.expiryDate)
      : propertyInfo.expiryDate
  }, [propertyInfo.expiryDate, startDate, selectedDuration])

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
          {tUpdate('description')}
        </CardDescription>
      </CardHeader>

      <CardContent className='px-0 space-y-6'>
        {/* Package Type Selection - Disabled */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Lock className='w-4 h-4 text-muted-foreground' />
              {t('selectPackageType')} (Chỉ xem)
            </CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {vipTiers.map((tier) => (
              <div
                key={tier.tierId}
                className={cn(
                  'relative h-auto p-5 border rounded-lg text-left flex-col items-center sm:items-start opacity-70 cursor-not-allowed',
                  selectedTier?.tierId === tier.tierId &&
                    'border-primary bg-primary/5 shadow-md',
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
                {selectedTier?.tierId === tier.tierId && (
                  <Card className='absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-0 p-0'>
                    <Check className='w-4 h-4 text-primary-foreground' />
                  </Card>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Duration Selection - Disabled */}
        <Card className='bg-muted/30'>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Lock className='w-4 h-4 text-muted-foreground' />
              {t('selectDuration')} (Chỉ xem)
            </CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {[10, 15, 30].map((days) => {
              return (
                <div
                  key={days}
                  className={cn(
                    'relative h-auto p-4 border rounded-lg text-left opacity-70 cursor-not-allowed',
                    selectedDuration === days && 'border-primary bg-primary/5',
                  )}
                >
                  <Card className='flex items-center justify-between w-full border-0 shadow-none p-0 bg-transparent'>
                    <CardContent className='p-0'>
                      <Typography className='font-bold text-lg'>
                        {days} {t('days')}
                      </Typography>
                    </CardContent>
                    <Card
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center p-0',
                        selectedDuration === days
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30 bg-transparent',
                      )}
                    >
                      {selectedDuration === days && (
                        <Card className='w-3 h-3 rounded-full bg-primary-foreground border-0 p-0' />
                      )}
                    </Card>
                  </Card>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Date Selection - All Readonly in Update */}
        <Card className='grid grid-cols-1 sm:grid-cols-2 gap-6 p-6'>
          <CardContent className='space-y-2 p-0'>
            <Label className='text-sm font-medium flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              <Lock className='w-3 h-3 text-muted-foreground' />
              {t('startDate')} (Chỉ xem)
            </Label>
            <Input
              value={startDate.toLocaleDateString('vi-VN')}
              disabled
              className='bg-muted cursor-not-allowed'
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
              <Calendar className='w-4 h-4' />
              <Lock className='w-3 h-3 text-muted-foreground' />
              {tUpdate('endDateAutoCalculated')}
            </Label>
            <Input
              value={endDate.toLocaleDateString('vi-VN')}
              disabled
              className='bg-muted cursor-not-allowed'
            />
            <Typography variant='muted' className='text-xs'>
              {tUpdate('endDateNote')}
            </Typography>
          </CardContent>
        </Card>

        <Card className='p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'>
          <Typography className='text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2'>
            <AlertCircle className='w-4 h-4' />
            {tUpdate('updateNote')}
          </Typography>
        </Card>
      </CardContent>
    </Card>
  )
}

export { PackageConfigSection }
export type { PackageConfigSectionProps }
