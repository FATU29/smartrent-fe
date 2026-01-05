import React from 'react'
import { useTranslations } from 'next-intl'
import { ArrowUp, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
import { Separator } from '@/components/atoms/separator'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { motion } from 'framer-motion'
import type { UpgradePreview } from '@/api/types/membership.type'
import { getMembershipLevelIcon } from '@/components/molecules/pricingPlanCard'
import { MembershipPackageLevel } from '@/api/types/membership.type'

export interface UpgradeCardProps {
  readonly upgrade: UpgradePreview
  readonly onUpgrade?: () => void
  readonly className?: string
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  onUpgrade,
  className,
}) => {
  const t = useTranslations('membershipUpgrade')
  const { language } = useSwitchLanguage()
  const locale = language

  const formattedOriginalPrice = formatByLocale(
    upgrade.targetPackagePrice || 0,
    locale,
  )
  const formattedDiscountAmount = formatByLocale(
    upgrade.discountAmount || 0,
    locale,
  )
  const formattedFinalPrice = formatByLocale(upgrade.finalPrice || 0, locale)

  const targetIcon = getMembershipLevelIcon(
    upgrade.targetPackageLevel as MembershipPackageLevel,
  )

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  if (!upgrade.eligible) {
    return null
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={cardVariants}
      whileTap={{ scale: 0.98 }}
      className='h-full w-full'
    >
      <Card
        className={cn(
          'relative h-full flex flex-col border-2 hover:border-primary/50 transition-all duration-300',
          className,
        )}
      >
        <CardHeader className='flex flex-col items-center text-center gap-3 pt-4 pb-4'>
          {upgrade.discountPercentage && upgrade.discountPercentage > 0 && (
            <Badge
              variant='default'
              className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 shadow-lg mb-2'
            >
              <TrendingUp className='size-3 mr-1' />
              {t('savePercent', {
                percent: upgrade.discountPercentage.toFixed(1),
              })}
            </Badge>
          )}
          {targetIcon}
          <Typography variant='h3' className='font-semibold'>
            {upgrade.targetPackageName}
          </Typography>
          <Typography variant='muted' className='text-sm'>
            {t('daysRemaining', { days: upgrade.daysRemaining || 0 })}
          </Typography>

          <div className='flex items-center gap-2 text-primary'>
            <ArrowUp className='size-5' />
            <Typography variant='small' className='font-medium'>
              {t('upgradingFrom', {
                currentPlan: upgrade.currentPackageName || '',
              })}
            </Typography>
          </div>
        </CardHeader>

        <CardContent className='flex-1 space-y-4'>
          {/* Pricing Section */}
          <div className='rounded-lg bg-muted/50 p-4 space-y-2'>
            <div className='flex justify-between items-center'>
              <Typography variant='small' className='text-muted-foreground'>
                {t('originalPrice')}
              </Typography>
              <Typography variant='small' className='line-through'>
                {formattedOriginalPrice}
              </Typography>
            </div>
            <div className='flex justify-between items-center text-green-600 dark:text-green-400'>
              <Typography variant='small' className='font-medium'>
                {t('discount')}
              </Typography>
              <Typography variant='small' className='font-medium'>
                -{formattedDiscountAmount}
              </Typography>
            </div>
            <div className='border-t pt-2 flex justify-between items-center'>
              <Typography variant='large' className='font-bold'>
                {t('finalPrice')}
              </Typography>
              <Typography variant='large' className='font-bold text-primary'>
                {formattedFinalPrice}
              </Typography>
            </div>
          </div>

          {/* Forfeited Benefits Warning */}
          {upgrade.forfeitedBenefits &&
            upgrade.forfeitedBenefits.length > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='size-4 text-amber-500' />
                  <Typography
                    variant='small'
                    className='font-medium text-amber-600 dark:text-amber-400'
                  >
                    {t('forfeitedBenefits')}
                  </Typography>
                </div>
                <div className='rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 space-y-2'>
                  {upgrade.forfeitedBenefits
                    .slice(0, 2)
                    .map((benefit, index) => (
                      <div key={index} className='flex items-start gap-2'>
                        <Typography
                          variant='small'
                          className='text-sm flex-1 items-center'
                        >
                          {benefit.benefitName}
                          {benefit.remainingQuantity > 0 && (
                            <span className='text-muted-foreground ml-1'>
                              ({benefit.remainingQuantity} {t('remaining')})
                            </span>
                          )}
                        </Typography>
                      </div>
                    ))}
                  {upgrade.forfeitedBenefits.length > 2 && (
                    <Typography
                      variant='small'
                      className='text-muted-foreground text-xs'
                    >
                      +{upgrade.forfeitedBenefits.length - 2}{' '}
                      {t('moreForfeited')}
                    </Typography>
                  )}
                </div>
              </div>
            )}

          <Separator />

          {/* New Benefits */}
          {upgrade.newBenefits && upgrade.newBenefits.length > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Typography
                  variant='small'
                  className='font-bold text-primary text-lg'
                >
                  {t('newBenefits')}
                </Typography>
              </div>
              <div className='space-y-1.5'>
                {upgrade.newBenefits.map((benefit, index) => {
                  const benefitName =
                    (benefit as any).benefitNameDisplay ||
                    (benefit as any).benefitName ||
                    ''

                  return (
                    <div key={index} className='flex items-start gap-2 py-1.5'>
                      <CheckCircle2 className='size-3.5 text-green-500 mt-0.5 flex-shrink-0' />
                      <Typography variant='small' className='text-sm flex-1'>
                        {benefitName}
                      </Typography>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className='mt-auto pt-6'>
          <Button className='w-full' onClick={onUpgrade} size='lg'>
            {t('upgradeButton')}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default UpgradeCard
