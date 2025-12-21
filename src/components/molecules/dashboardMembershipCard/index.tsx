import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import {
  Crown,
  Calendar,
  Gift,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuth } from '@/hooks/useAuth'
import { MembershipStatus, BenefitStatus } from '@/api/types/membership.type'
import { format } from 'date-fns'
import { Button } from '@/components/atoms/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const DashboardMembershipCard: React.FC = () => {
  const t = useTranslations('seller.dashboard.membership')
  const { user } = useAuth()
  const { data: membership, isLoading } = useMyMembership(user?.userId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Crown className='h-5 w-5 text-primary' />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!membership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Crown className='h-5 w-5 text-primary' />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('noMembership')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href='/sellernet/membership/register'>
            <Button className='w-full' variant='default'>
              {t('upgradeNow')}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const isActive = membership.status === MembershipStatus.ACTIVE
  const activeBenefits = membership.benefits.filter(
    (benefit) => benefit.status === BenefitStatus.ACTIVE,
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
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
    <Card className='overflow-hidden'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className='flex items-center gap-2'>
              <Crown className='h-6 w-6 text-blue-600' />
              <span className='text-foreground'>{membership.packageName}</span>
            </CardTitle>
            <CardDescription className='mt-1 flex items-center gap-2'>
              <Sparkles className='h-3 w-3 text-blue-600' />
              {t('packageLevel')}:{' '}
              <span className='font-semibold'>{membership.packageLevel}</span>
            </CardDescription>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className='font-semibold'
            >
              {membership.status}
            </Badge>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Membership Period */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='flex items-center gap-3 p-3 rounded-lg bg-muted border border-border'
        >
          <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100'>
            <Calendar className='h-5 w-5 text-blue-600' />
          </div>
          <div className='flex-1'>
            <p className='text-xs text-muted-foreground'>{t('validUntil')}</p>
            <p className='text-sm font-semibold text-foreground'>
              {format(new Date(membership.endDate), 'dd/MM/yyyy')}
            </p>
          </div>
        </motion.div>

        {/* Days Remaining */}
        {isActive && membership.daysRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='rounded-lg bg-primary p-4 text-primary-foreground'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                <span className='font-semibold'>{t('daysRemaining')}</span>
              </div>
              <span className='text-2xl font-bold'>
                {membership.daysRemaining}
              </span>
            </div>
          </motion.div>
        )}

        {/* Active Benefits */}
        {activeBenefits.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='space-y-3'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-sm font-semibold'>
                <Gift className='h-5 w-5 text-blue-600' />
                <span className='text-foreground'>{t('activeBenefits')}</span>
              </div>
              <Badge variant='secondary' className='font-semibold'>
                {activeBenefits.length} {t('benefits')}
              </Badge>
            </div>

            <div className='space-y-2'>
              {activeBenefits.map((benefit, index) => {
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
                    variants={itemVariants}
                    className={cn(
                      'p-3 rounded-lg border transition-all hover:shadow-md',
                      colorClass,
                    )}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex items-start gap-2 flex-1'>
                        <CheckCircle2 className='h-4 w-4 mt-0.5 flex-shrink-0 text-green-600' />
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
                          delay: 0.5 + index * 0.1,
                          ease: 'easeOut',
                        }}
                        className={cn('h-full', progressColor)}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardMembershipCard
