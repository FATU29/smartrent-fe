import React from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Zap,
  Gift,
} from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
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
    <TooltipProvider>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={cardVariants}
        whileTap={{ scale: 0.98 }}
        className='h-full w-full'
      >
        <Card
          className={cn(
            'relative h-full flex flex-col border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden',
            className,
          )}
        >
          <CardHeader className='flex flex-col items-center text-center gap-3 pt-6 pb-4 relative'>
            {/* Discount Badge with Tooltip */}
            {upgrade.discountPercentage && upgrade.discountPercentage > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant='default'
                    className='bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 shadow-lg mb-2 cursor-help border-0'
                  >
                    <Gift className='size-3.5 mr-1.5' />
                    {t('savePercent', {
                      percent: upgrade.discountPercentage.toFixed(1),
                    })}
                    <Info className='size-3 ml-1.5 opacity-70' />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent
                  side='top'
                  className='max-w-xs p-4 bg-background border-2 border-green-200 dark:border-green-800 shadow-xl'
                >
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold'>
                      <Sparkles className='size-4' />
                      <span>{t('discountExplanation.title')}</span>
                    </div>
                    <Typography variant='small' className='text-foreground'>
                      {t('discountExplanation.description', {
                        days: upgrade.daysRemaining || 0,
                        percent: upgrade.discountPercentage.toFixed(1),
                      })}
                    </Typography>
                    <div className='flex items-start gap-2 pt-2 border-t border-green-200 dark:border-green-800'>
                      <Zap className='size-3.5 text-amber-500 flex-shrink-0 mt-0.5' />
                      <Typography
                        variant='small'
                        className='text-xs text-muted-foreground'
                      >
                        {t('discountExplanation.savings', {
                          amount: formattedDiscountAmount,
                        })}
                      </Typography>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Icon with animation */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {targetIcon}
            </motion.div>

            <div className='space-y-1'>
              <Typography variant='h3' className='font-bold'>
                {upgrade.targetPackageName}
              </Typography>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex items-center gap-1.5 text-muted-foreground cursor-help mx-auto w-fit'>
                    <Typography variant='small' className='text-sm'>
                      {t('daysRemaining', { days: upgrade.daysRemaining || 0 })}
                    </Typography>
                    <Info className='size-3' />
                  </div>
                </TooltipTrigger>
                <TooltipContent side='bottom' className='max-w-xs'>
                  <Typography variant='small'>
                    {t('remainingTimeExplanation')}
                  </Typography>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className='flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full'>
              <ArrowUp className='size-4' />
              <Typography variant='small' className='font-medium'>
                {t('upgradingFrom', {
                  currentPlan: upgrade.currentPackageName || '',
                })}
              </Typography>
            </div>
          </CardHeader>

          <CardContent className='flex-1 space-y-4'>
            {/* Pricing Section with enhanced design */}
            <div className='rounded-xl bg-muted/50 p-5 space-y-3 border border-border shadow-sm'>
              <div className='flex justify-between items-center'>
                <Typography variant='small' className='text-muted-foreground'>
                  {t('originalPrice')}
                </Typography>
                <Typography
                  variant='small'
                  className='line-through text-muted-foreground'
                >
                  {formattedOriginalPrice}
                </Typography>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-1.5'>
                  <Typography
                    variant='small'
                    className='font-semibold text-green-600 dark:text-green-400'
                  >
                    {t('discount')}
                  </Typography>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='size-3.5 text-green-600 dark:text-green-400 cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent side='top' className='max-w-xs'>
                      <Typography variant='small'>
                        {t('discountExplanation.howItWorks')}
                      </Typography>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Typography
                  variant='small'
                  className='font-semibold text-green-600 dark:text-green-400'
                >
                  -{formattedDiscountAmount}
                </Typography>
              </div>
              <Separator className='bg-border/50' />
              <div className='flex justify-between items-center pt-1'>
                <Typography variant='large' className='font-bold'>
                  {t('finalPrice')}
                </Typography>
                <div className='flex flex-col items-end'>
                  <Typography
                    variant='large'
                    className='font-bold text-primary text-xl'
                  >
                    {formattedFinalPrice}
                  </Typography>
                  {upgrade.discountPercentage &&
                    upgrade.discountPercentage > 0 && (
                      <Typography
                        variant='small'
                        className='text-xs text-green-600 dark:text-green-400 font-medium'
                      >
                        {t('youSave')} {formattedDiscountAmount}
                      </Typography>
                    )}
                </div>
              </div>
            </div>

            {/* Forfeited Benefits Warning with improved UI */}
            {upgrade.forfeitedBenefits &&
              upgrade.forfeitedBenefits.length > 0 && (
                <div className='space-y-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex items-center gap-2 cursor-help w-fit'>
                        <AlertTriangle className='size-4 text-amber-500' />
                        <Typography
                          variant='small'
                          className='font-semibold text-amber-600 dark:text-amber-400'
                        >
                          {t('forfeitedBenefits')}
                        </Typography>
                        <Info className='size-3.5 text-amber-500' />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='max-w-xs'>
                      <Typography variant='small'>
                        {t('forfeitedExplanation')}
                      </Typography>
                    </TooltipContent>
                  </Tooltip>
                  <div className='rounded-xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 p-4 space-y-2.5'>
                    {upgrade.forfeitedBenefits
                      .slice(0, 2)
                      .map((benefit, index) => (
                        <div
                          key={index}
                          className='flex items-start gap-2 text-amber-900 dark:text-amber-100'
                        >
                          <div className='flex-shrink-0 mt-0.5'>
                            <div className='w-1.5 h-1.5 rounded-full bg-amber-500' />
                          </div>
                          <Typography
                            variant='small'
                            className='text-sm flex-1 font-medium'
                          >
                            {benefit.benefitName}
                            {benefit.remainingQuantity > 0 && (
                              <span className='text-muted-foreground ml-1 font-normal'>
                                ({benefit.remainingQuantity} {t('remaining')})
                              </span>
                            )}
                          </Typography>
                        </div>
                      ))}
                    {upgrade.forfeitedBenefits.length > 2 && (
                      <Typography
                        variant='small'
                        className='text-amber-700 dark:text-amber-300 text-xs font-medium pl-4'
                      >
                        +{upgrade.forfeitedBenefits.length - 2}{' '}
                        {t('moreForfeited')}
                      </Typography>
                    )}
                  </div>
                </div>
              )}

            <Separator />

            {/* New Benefits with enhanced styling */}
            {upgrade.newBenefits && upgrade.newBenefits.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='size-4 text-primary' />
                  <Typography
                    variant='small'
                    className='font-bold text-primary text-base'
                  >
                    {t('newBenefits')}
                  </Typography>
                </div>
                <div className='space-y-2 pl-1'>
                  {upgrade.newBenefits.map((benefit, index) => {
                    const benefitName =
                      (benefit as any).benefitNameDisplay ||
                      (benefit as any).benefitName ||
                      ''

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className='flex items-start gap-2.5 py-1.5 group'
                      >
                        <div className='flex-shrink-0 mt-0.5'>
                          <CheckCircle2 className='size-4 text-green-500 group-hover:scale-110 transition-transform' />
                        </div>
                        <Typography
                          variant='small'
                          className='text-sm flex-1 font-medium text-foreground'
                        >
                          {benefitName}
                        </Typography>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className='mt-auto pt-6 pb-6'>
            <Button
              className='w-full group bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300'
              onClick={onUpgrade}
              size='lg'
            >
              <span className='flex items-center justify-center gap-2'>
                <Zap className='size-4 group-hover:scale-110 transition-transform' />
                {t('upgradeButton')}
              </span>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

export default UpgradeCard
