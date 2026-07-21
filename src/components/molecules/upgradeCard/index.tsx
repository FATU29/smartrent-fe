import React from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Zap,
  Tag,
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
import { motion } from 'motion/react'
import type { UpgradePreview } from '@/api/types/membership.type'
import {
  getMembershipLevelIcon,
  getMembershipLevelTileClasses,
} from '@/components/molecules/pricingPlanCard'
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

  const formattedOriginalPrice = formatByLocale(
    upgrade.targetPackagePrice || 0,
    'vi',
  )
  const formattedDiscountAmount = formatByLocale(
    upgrade.discountAmount || 0,
    'vi',
  )
  const formattedFinalPrice = formatByLocale(upgrade.finalPrice || 0, 'vi')

  const targetLevel = upgrade.targetPackageLevel as MembershipPackageLevel
  const targetIcon = getMembershipLevelIcon(targetLevel)
  const targetIconTile = getMembershipLevelTileClasses(targetLevel)
  const isQueuedContext = upgrade.upgradeContext === 'QUEUED'

  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
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
        className='h-full w-full'
      >
        <Card
          className={cn(
            'relative h-full flex flex-col bg-card border-border',
            'transition-colors duration-200 hover:border-primary/40 overflow-hidden',
            className,
          )}
        >
          <CardHeader className='flex flex-col items-center text-center gap-3 pt-6 pb-4 relative'>
            {/* Discount Badge */}
            {upgrade.discountPercentage && upgrade.discountPercentage > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant='secondary'
                    className='gap-1.5 px-2.5 py-0.5 mb-1 text-xs font-medium border border-border cursor-help [&>svg]:size-3.5'
                  >
                    <Tag className='text-primary' />
                    <span>
                      {t('savePercent', {
                        percent: upgrade.discountPercentage.toFixed(1),
                      })}
                    </span>
                    <Info className='opacity-60' />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side='top' className='max-w-xs p-3'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-foreground font-medium'>
                      <Sparkles className='size-4 text-primary' />
                      <span>{t('discountExplanation.title')}</span>
                    </div>
                    <Typography
                      variant='small'
                      className='text-muted-foreground'
                    >
                      {isQueuedContext
                        ? t('discountExplanation.descriptionQueued', {
                            percent: upgrade.discountPercentage.toFixed(1),
                          })
                        : t('discountExplanation.description', {
                            days: upgrade.daysRemaining || 0,
                            percent: upgrade.discountPercentage.toFixed(1),
                          })}
                    </Typography>
                    <div className='flex items-start gap-2 pt-2 border-t border-border'>
                      <Zap className='size-3.5 text-primary flex-shrink-0 mt-0.5' />
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

            {/* Icon tile */}
            <div
              className={cn(
                'size-12 flex items-center justify-center rounded-lg border',
                targetIconTile,
              )}
            >
              {targetIcon}
            </div>

            <div className='space-y-1'>
              <Typography variant='h3' className='font-semibold'>
                {upgrade.targetPackageName}
              </Typography>
              {isQueuedContext ? (
                <Badge variant='outline' className='text-xs font-medium'>
                  {t('queuedBadge')}
                </Badge>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-1.5 text-muted-foreground cursor-help mx-auto w-fit'>
                      <Typography variant='small' className='text-sm'>
                        {t('daysRemaining', {
                          days: upgrade.daysRemaining || 0,
                        })}
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
              )}
            </div>

            <div className='flex items-center gap-2 text-muted-foreground bg-muted/50 border border-border px-2.5 py-1 rounded-md'>
              <ArrowUp className='size-3.5' />
              <Typography variant='small' className='text-xs font-medium'>
                {t('upgradingFrom', {
                  currentPlan: upgrade.currentPackageName || '',
                })}
              </Typography>
            </div>
          </CardHeader>

          <CardContent className='flex-1 space-y-4'>
            {/* Pricing Section */}
            <div className='rounded-lg bg-muted/40 p-4 space-y-2.5 border border-border'>
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
                    className='font-medium text-foreground'
                  >
                    {t('discount')}
                  </Typography>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='size-3.5 text-muted-foreground cursor-help' />
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
                  className='font-medium text-foreground'
                >
                  -{formattedDiscountAmount}
                </Typography>
              </div>
              <Separator />
              <div className='flex justify-between items-center pt-0.5'>
                <Typography variant='large' className='font-semibold'>
                  {t('finalPrice')}
                </Typography>
                <div className='flex flex-col items-end'>
                  <Typography
                    variant='large'
                    className='font-semibold text-primary'
                  >
                    {formattedFinalPrice}
                  </Typography>
                  {upgrade.discountPercentage &&
                    upgrade.discountPercentage > 0 && (
                      <Typography
                        variant='small'
                        className='text-xs text-muted-foreground'
                      >
                        {t('youSave')} {formattedDiscountAmount}
                      </Typography>
                    )}
                </div>
              </div>
            </div>

            {/* Forfeited Benefits Warning */}
            {upgrade.forfeitedBenefits &&
              upgrade.forfeitedBenefits.length > 0 && (
                <div className='space-y-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='flex items-center gap-2 cursor-help w-fit'>
                        <AlertTriangle className='size-4 text-destructive' />
                        <Typography
                          variant='small'
                          className='font-medium text-foreground'
                        >
                          {t('forfeitedBenefits')}
                        </Typography>
                        <Info className='size-3.5 text-muted-foreground' />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='top' className='max-w-xs'>
                      <Typography variant='small'>
                        {t('forfeitedExplanation')}
                      </Typography>
                    </TooltipContent>
                  </Tooltip>
                  <div className='rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2'>
                    {upgrade.forfeitedBenefits
                      .slice(0, 2)
                      .map((benefit, index) => (
                        <div
                          key={index}
                          className='flex items-start gap-2 text-foreground'
                        >
                          <div className='flex-shrink-0 mt-1.5'>
                            <div className='size-1.5 rounded-full bg-destructive/70' />
                          </div>
                          <Typography
                            variant='small'
                            className='text-sm flex-1'
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
                        className='text-muted-foreground text-xs pl-3.5'
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
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='size-4 text-primary' />
                  <Typography
                    variant='small'
                    className='font-semibold text-foreground'
                  >
                    {t('newBenefits')}
                  </Typography>
                </div>
                <div className='space-y-1.5 pl-1'>
                  {upgrade.newBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className='flex items-start gap-2.5 py-1'
                    >
                      <CheckCircle2 className='size-4 text-primary flex-shrink-0 mt-0.5' />
                      <Typography
                        variant='small'
                        className='text-sm flex-1 text-foreground'
                      >
                        {benefit.benefitNameDisplay}
                      </Typography>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className='mt-auto pt-6 pb-6'>
            <Button
              className='w-full font-medium transition-colors duration-200'
              onClick={onUpgrade}
              size='lg'
            >
              <span className='flex items-center justify-center gap-2'>
                <Zap className='size-4' />
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
