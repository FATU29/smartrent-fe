import { SELLERNET_ROUTES } from '@/constants'
import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/atoms/button'
import {
  Crown,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuth } from '@/hooks/useAuth'
import { Typography } from '@/components/atoms/typography'

const DashboardMembershipNavCard: React.FC = () => {
  const t = useTranslations('seller.dashboard.membership')
  const { user } = useAuth()
  const { data: membership } = useMyMembership(user?.userId)

  const features = [
    {
      icon: Zap,
      text: t('feature1'),
    },
    {
      icon: Shield,
      text: t('feature2'),
    },
    {
      icon: TrendingUp,
      text: t('feature3'),
    },
  ]

  return (
    <div className='relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-4 sm:p-6 md:p-8'>
      {/* Background decoration */}
      <div className='absolute right-0 top-0 -z-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute bottom-0 left-0 -z-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl' />

      <div className='relative z-10 space-y-5 sm:space-y-6'>
        {/* Header */}
        <div className='space-y-2.5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 sm:h-12 sm:w-12'>
              <Crown className='h-5 w-5 text-primary sm:h-6 sm:w-6' />
            </div>
            <Typography variant='h4' className='tracking-tight'>
              {t('upgradeTitle')}
            </Typography>
          </div>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            {t('upgradeDescription')}
          </p>
        </div>

        {/* Features List */}
        <div className='space-y-2.5'>
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.text} className='flex items-start gap-3'>
                <div className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                  <Icon className='h-3 w-3 text-primary' />
                </div>
                <p className='text-sm text-foreground'>{feature.text}</p>
              </div>
            )
          })}
        </div>

        {/* CTA Button - Always goes to register page (shows upgrade or purchase) */}
        <Link href={SELLERNET_ROUTES.MEMBERSHIP_REGISTER} className='block'>
          <Button className='w-full' size='lg' variant='default'>
            {membership ? (
              <>
                <TrendingUp className='mr-2 h-4 w-4' />
                {t('upgradeButton')}
                <ArrowRight className='ml-2 h-4 w-4' />
              </>
            ) : (
              <>
                <Sparkles className='mr-2 h-4 w-4' />
                {t('viewPlans')}
                <ArrowRight className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default DashboardMembershipNavCard
