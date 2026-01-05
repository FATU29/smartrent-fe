import React, { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Separator } from '@/components/atoms/separator'
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatByLocale } from '@/utils/currency/convert'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import type { UpgradePreview } from '@/api/types/membership.type'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export interface UpgradePreviewModalProps {
  readonly open: boolean
  readonly preview: UpgradePreview | null
  readonly onConfirm: () => void
  readonly onCancel: () => void
  readonly isLoading?: boolean
}

export const UpgradePreviewModal: React.FC<UpgradePreviewModalProps> = ({
  open,
  preview,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const t = useTranslations('membershipUpgrade.preview')
  const { language } = useSwitchLanguage()
  const locale = language
  const isMobile = useMediaQuery('(max-width: 767px)')

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onCancel()
    }
  }, [isLoading, onCancel])

  if (!preview) return null

  // Check eligibility
  if (!preview.eligible) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent
          className='sm:max-w-[500px]'
          showCloseButton={!isLoading}
        >
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <XCircle className='size-5 text-destructive' />
              {t('notEligibleTitle')}
            </DialogTitle>
            <DialogDescription>
              {preview.ineligibilityReason || t('notEligibleMessage')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const formattedOriginalPrice = formatByLocale(
    preview.targetPackagePrice || 0,
    locale,
  )
  const formattedDiscountAmount = formatByLocale(
    preview.discountAmount || 0,
    locale,
  )
  const formattedFinalPrice = formatByLocale(preview.finalPrice || 0, locale)

  const isFreeUpgrade = (preview.finalPrice || 0) === 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={cn(
          'flex flex-col p-0',
          isMobile
            ? 'w-full h-screen max-w-full rounded-none m-0'
            : 'sm:max-w-[600px] max-h-[90vh]',
        )}
        showCloseButton={!isLoading}
        onInteractOutside={(e) => {
          if (isLoading) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader className='px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex-shrink-0'>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'flex-1 overflow-y-auto px-4 sm:px-6 min-h-0 scrollbar-thin',
          )}
        >
          <div className='space-y-6 py-4'>
            {/* Current and New Plan */}
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='flex-1 rounded-lg bg-muted/50 p-3'>
                  <Typography variant='small' className='text-muted-foreground'>
                    {t('currentPlan')}
                  </Typography>
                  <Typography variant='large' className='font-semibold'>
                    {preview.currentPackageName}
                  </Typography>
                  <Typography variant='small' className='text-muted-foreground'>
                    {t('daysRemaining', { days: preview.daysRemaining || 0 })}
                  </Typography>
                </div>
                <ArrowRight className='size-5 text-primary flex-shrink-0' />
                <div className='flex-1 rounded-lg bg-primary/10 p-3 border-2 border-primary'>
                  <Typography variant='small' className='text-muted-foreground'>
                    {t('newPlan')}
                  </Typography>
                  <Typography variant='large' className='font-semibold'>
                    {preview.targetPackageName}
                  </Typography>
                  <Typography variant='small' className='text-muted-foreground'>
                    {t('duration', { days: preview.targetDurationDays || 0 })}
                  </Typography>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Breakdown */}
            <div className='space-y-3'>
              <Typography variant='large' className='font-semibold'>
                {t('pricing')}
              </Typography>
              <div className='rounded-lg bg-muted/50 p-4 space-y-3'>
                <div className='flex justify-between items-center'>
                  <Typography variant='p' className='text-muted-foreground'>
                    {t('originalPrice')}
                  </Typography>
                  <Typography variant='p'>{formattedOriginalPrice}</Typography>
                </div>
                <div className='flex justify-between items-center text-green-600 dark:text-green-400'>
                  <Typography variant='p' className='font-medium'>
                    {t('yourDiscount')}{' '}
                    {preview.discountPercentage && (
                      <span className='text-sm'>
                        ({preview.discountPercentage.toFixed(1)}%)
                      </span>
                    )}
                  </Typography>
                  <Typography variant='p' className='font-medium'>
                    -{formattedDiscountAmount}
                  </Typography>
                </div>
                <Separator />
                <div className='flex justify-between items-center'>
                  <Typography variant='large' className='font-bold'>
                    {t('finalPrice')}
                  </Typography>
                  <Typography
                    variant='h3'
                    className={cn('font-bold', {
                      'text-green-600 dark:text-green-400': isFreeUpgrade,
                      'text-primary': !isFreeUpgrade,
                    })}
                  >
                    {isFreeUpgrade ? t('free') : formattedFinalPrice}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Forfeited Benefits Warning */}
            {preview.forfeitedBenefits &&
              preview.forfeitedBenefits.length > 0 && (
                <>
                  <Separator />
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <AlertTriangle className='size-4 text-amber-500' />
                      <Typography
                        variant='small'
                        className='font-medium text-amber-600 dark:text-amber-400'
                      >
                        {t('forfeitedBenefitsTitle')}
                      </Typography>
                    </div>
                    <div className='rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 space-y-2'>
                      {preview.forfeitedBenefits.map((benefit, index) => (
                        <div key={index} className='flex items-start gap-2'>
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
                    </div>
                  </div>
                </>
              )}

            {/* New Benefits */}
            {preview.newBenefits && preview.newBenefits.length > 0 && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <Typography
                    variant='small'
                    className='font-bold text-primary text-lg'
                  >
                    {t('newBenefitsTitle')}
                  </Typography>
                  <div className='space-y-1.5'>
                    {preview.newBenefits.map((benefit, index) => {
                      const benefitName =
                        (benefit as any).benefitNameDisplay ||
                        (benefit as any).benefitName ||
                        ''

                      return (
                        <div
                          key={index}
                          className='flex items-start gap-2 py-1.5'
                        >
                          <CheckCircle2 className='size-3.5 text-green-500 mt-0.5 flex-shrink-0' />
                          <Typography
                            variant='small'
                            className='text-sm flex-1'
                          >
                            {benefitName}
                          </Typography>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Free Upgrade Message */}
            {isFreeUpgrade && (
              <Alert variant='default' className='border-green-500'>
                <CheckCircle2 className='size-4 text-green-500' />
                <AlertTitle>{t('freeUpgradeTitle')}</AlertTitle>
                <AlertDescription>{t('freeUpgradeMessage')}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter className='flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center sm:justify-end px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t flex-shrink-0 bg-background'>
          <Button
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
            className='w-full sm:w-auto'
            size={isMobile ? 'lg' : 'default'}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            size='lg'
            className='w-full sm:w-auto'
          >
            {isLoading
              ? t('processing')
              : isFreeUpgrade
                ? t('confirmFreeUpgrade')
                : t('confirmUpgrade')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpgradePreviewModal
