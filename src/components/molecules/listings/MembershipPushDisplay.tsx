import React from 'react'
import { Skeleton } from '@/components/atoms/skeleton'
import { cn } from '@/lib/utils'
import {
  BenefitType,
  BenefitStatus,
  GetMyMembershipResponse,
} from '@/api/types'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Zap, Calendar, Crown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MembershipPushDisplayProps {
  membershipData: GetMyMembershipResponse | null | undefined
  isLoading: boolean
  className?: string
}

export const MembershipPushDisplay: React.FC<MembershipPushDisplayProps> = ({
  membershipData,
  isLoading,
  className,
}) => {
  const t = useTranslations('seller.dashboard.membership')

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className='h-20 w-full rounded-lg' />
        <Skeleton className='h-24 w-full rounded-lg' />
      </div>
    )
  }

  if (!membershipData) {
    return null
  }

  const pushBenefits = membershipData.benefits?.filter(
    (benefit) =>
      benefit.status === BenefitStatus.ACTIVE &&
      (benefit.benefitType === BenefitType.PUSH ||
        benefit.benefitType === BenefitType.PUSH_STANDARD ||
        benefit.benefitType === BenefitType.SCHEDULED_PUSH),
  )

  if (!pushBenefits || pushBenefits.length === 0) {
    return null
  }

  const getBenefitProgress = (remaining: number, total: number) => {
    return (remaining / total) * 100
  }

  const getBenefitColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100
    if (percentage > 50) return 'text-foreground bg-muted border-border'
    if (percentage > 20) return 'text-foreground bg-amber-50 border-amber-200'
    return 'text-foreground bg-red-50 border-red-200'
  }

  const getBenefitProgressColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100
    if (percentage > 50) return 'bg-primary'
    if (percentage > 20) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Membership Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
      >
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100'>
            <Crown className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <p className='text-sm font-semibold text-foreground'>
              {membershipData.packageName}
            </p>
            <p className='text-xs text-muted-foreground'>
              {membershipData.packageLevel}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <div className='flex items-center gap-1.5'>
            <Calendar className='h-3.5 w-3.5 text-blue-600' />
            <p className='text-xs text-muted-foreground'>
              {t('daysRemaining')}
            </p>
          </div>
          <p className='text-lg font-bold text-blue-600'>
            {membershipData.daysRemaining}
          </p>
        </div>
      </motion.div>

      {/* Push Benefits */}
      <div className='space-y-2'>
        {pushBenefits.map((benefit, index) => {
          const progress = getBenefitProgress(
            benefit.quantityRemaining,
            benefit.totalQuantity,
          )
          const colorClass = getBenefitColor(
            benefit.quantityRemaining,
            benefit.totalQuantity,
          )
          const progressColor = getBenefitProgressColor(
            benefit.quantityRemaining,
            benefit.totalQuantity,
          )

          return (
            <motion.div
              key={benefit.userBenefitId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'p-3 rounded-lg border transition-all hover:shadow-md',
                colorClass,
              )}
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-start gap-2 flex-1'>
                  <Zap className='h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold leading-tight'>
                      {benefit.benefitNameDisplay}
                    </p>
                    <p className='text-xs opacity-75 mt-0.5'>
                      {t('expires')}:{' '}
                      {format(new Date(benefit.expiresAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                <div className='text-right ml-2'>
                  <p className='text-sm font-bold'>
                    {benefit.quantityRemaining}
                  </p>
                  <p className='text-xs opacity-75'>
                    {t('of')} {benefit.totalQuantity}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='w-full bg-white/50 rounded-full h-1.5 overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.3 + index * 0.1,
                    ease: 'easeOut',
                  }}
                  className={cn('h-full', progressColor)}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export const MembershipPushDisplaySkeleton: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200',
        className,
      )}
    >
      <Skeleton className='h-5 w-5 rounded' />
      <Skeleton className='h-5 w-32' />
      <Skeleton className='h-6 w-12 rounded-full ml-auto' />
    </div>
  )
}
