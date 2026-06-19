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

  const getBenefitProgress = (remaining: number, total: number) =>
    total > 0 ? (remaining / total) * 100 : 0

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = getBenefitProgress(remaining, total)
    if (percentage > 50) return 'bg-primary'
    if (percentage > 20) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getCountColor = (remaining: number, total: number) =>
    getBenefitProgress(remaining, total) > 20
      ? 'text-foreground'
      : 'text-red-600 dark:text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex w-full max-w-full flex-wrap items-center gap-x-4 gap-y-2.5 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-2.5 sm:w-fit sm:p-3',
        className,
      )}
    >
      {/* Membership summary */}
      <div className='flex min-w-0 items-center gap-2.5'>
        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 sm:h-9 sm:w-9'>
          <Crown className='h-4 w-4 text-primary sm:h-5 sm:w-5' />
        </div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-foreground'>
            {membershipData.packageName}
          </p>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <span className='truncate'>{membershipData.packageLevel}</span>
            <span aria-hidden className='text-muted-foreground/50'>
              ·
            </span>
            <span className='flex items-center gap-1 whitespace-nowrap'>
              <Calendar className='h-3 w-3' />
              {t('daysLeftShort', { days: membershipData.daysRemaining })}
            </span>
          </div>
        </div>
      </div>

      {/* Divider (desktop only) */}
      <div className='hidden h-9 w-px bg-primary/15 sm:block' />

      {/* Push benefits */}
      <div className='flex flex-wrap items-center gap-2'>
        {pushBenefits.map((benefit) => {
          const progress = getBenefitProgress(
            benefit.quantityRemaining,
            benefit.totalQuantity,
          )

          return (
            <div
              key={benefit.userBenefitId}
              title={`${t('expires')}: ${format(new Date(benefit.expiresAt), 'dd/MM/yyyy')}`}
              className='flex min-w-0 items-center gap-2 rounded-md border border-border bg-background/60 px-2.5 py-1.5'
            >
              <Zap className='h-4 w-4 flex-shrink-0 text-primary' />
              <div className='min-w-0'>
                <p className='max-w-[180px] truncate text-xs font-medium text-foreground'>
                  {benefit.benefitNameDisplay}
                </p>
                <div className='mt-1 flex items-center gap-1.5'>
                  <div className='h-1 w-14 overflow-hidden rounded-full bg-muted'>
                    <div
                      className={cn(
                        'h-full rounded-full',
                        getProgressColor(
                          benefit.quantityRemaining,
                          benefit.totalQuantity,
                        ),
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-micro font-semibold tabular-nums',
                      getCountColor(
                        benefit.quantityRemaining,
                        benefit.totalQuantity,
                      ),
                    )}
                  >
                    {benefit.quantityRemaining}/{benefit.totalQuantity}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export const MembershipPushDisplaySkeleton: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border',
        className,
      )}
    >
      <Skeleton className='h-5 w-5 rounded' />
      <Skeleton className='h-5 w-32' />
      <Skeleton className='h-6 w-12 rounded-full ml-auto' />
    </div>
  )
}
