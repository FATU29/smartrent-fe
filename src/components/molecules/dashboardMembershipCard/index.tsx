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
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuth } from '@/hooks/useAuth'
import { MembershipStatus, BenefitStatus } from '@/api/types/membership.type'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

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
      <Card className='relative overflow-hidden'>
        {/* Background decoration */}
        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32' />
        <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full translate-y-24 -translate-x-24' />

        <CardHeader className='relative'>
          <CardTitle className='flex items-center gap-2'>
            <Crown className='h-5 w-5 text-primary' />
            {t('title')}
          </CardTitle>
        </CardHeader>

        <CardContent className='relative space-y-6'>
          {/* Empty State Icon & Text */}
          <div className='flex flex-col items-center justify-center py-6 text-center'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className='relative mb-6'
            >
              <div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl' />
              <div className='relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70'>
                <Crown className='h-10 w-10 text-primary-foreground' />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className='text-lg font-semibold mb-2 text-foreground'>
                {t('emptyState.title')}
              </h3>
              <p className='text-sm text-muted-foreground max-w-sm'>
                {t('emptyState.description')}
              </p>
            </motion.div>
          </div>

          {/* Benefits Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='grid grid-cols-1 gap-3'
          >
            <div className='flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/10'>
              <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                <Sparkles className='h-4 w-4 text-primary' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium text-foreground'>
                  {t('emptyState.benefit1.title')}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('emptyState.benefit1.desc')}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/10'>
              <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                <TrendingUp className='h-4 w-4 text-primary' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium text-foreground'>
                  {t('emptyState.benefit2.title')}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('emptyState.benefit2.desc')}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/10'>
              <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                <Gift className='h-4 w-4 text-primary' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium text-foreground'>
                  {t('emptyState.benefit3.title')}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('emptyState.benefit3.desc')}
                </p>
              </div>
            </div>
          </motion.div>
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

  return (
    <Card className='relative overflow-hidden'>
      {/* Subtle brand wash behind the header for a more premium feel */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/5 to-transparent'
      />
      <CardHeader className='relative'>
        <div className='flex items-start justify-between gap-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='flex items-start gap-3'
          >
            <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15'>
              <Crown className='h-6 w-6 text-primary' />
            </span>
            <div className='space-y-1'>
              <CardTitle className='text-foreground'>
                {membership.packageName}
              </CardTitle>
              <CardDescription className='flex items-center gap-1.5'>
                <Sparkles className='h-3.5 w-3.5 text-primary' />
                {t('packageLevel')}:{' '}
                <span className='font-semibold text-foreground'>
                  {membership.packageLevel}
                </span>
              </CardDescription>
            </div>
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
      <CardContent className='space-y-4 sm:space-y-6'>
        {/* Membership Period */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='flex items-center gap-3 p-3 rounded-lg bg-muted border border-border'
        >
          <div className='flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-primary/10 sm:w-10 sm:h-10'>
            <Calendar className='h-4 w-4 text-primary sm:h-5 sm:w-5' />
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
            className='rounded-lg bg-primary p-3 text-primary-foreground sm:p-4'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4 sm:h-5 sm:w-5' />
                <span className='text-sm font-semibold sm:text-base'>
                  {t('daysRemaining')}
                </span>
              </div>
              <span className='text-heading font-bold'>
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
                <Gift className='h-5 w-5 text-primary' />
                <span className='text-foreground'>{t('activeBenefits')}</span>
              </div>
              <Badge variant='secondary' className='font-semibold'>
                {activeBenefits.length} {t('benefits')}
              </Badge>
            </div>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {activeBenefits.map((benefit, index) => {
                const progress = getBenefitProgress(
                  benefit.quantityRemaining,
                  benefit.totalQuantity,
                )

                return (
                  <motion.div
                    key={benefit.userBenefitId}
                    variants={itemVariants}
                    className='h-full p-3 rounded-lg border border-border bg-muted text-foreground transition-all hover:shadow-md'
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
                    <div className='w-full bg-background/50 rounded-full h-1.5 overflow-hidden'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.5 + index * 0.1,
                          ease: 'easeOut',
                        }}
                        className='h-full bg-primary'
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
