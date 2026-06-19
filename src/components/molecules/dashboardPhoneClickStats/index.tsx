import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Phone, Eye, Percent, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OwnerListingAnalytics } from '@/api/types'

interface DashboardPhoneClickStatsProps {
  analytics?: OwnerListingAnalytics | null
  isLoading?: boolean
}

const DashboardPhoneClickStats: React.FC<DashboardPhoneClickStatsProps> = ({
  analytics,
  isLoading = false,
}) => {
  const t = useTranslations('seller.dashboard.phoneClicks')

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5'>
        {[1, 2, 3].map((i) => (
          <Card key={i} className='border-border/70 bg-card/80 py-0'>
            <CardContent className='flex items-center gap-2 p-3 text-sm font-medium text-muted-foreground sm:p-4'>
              <Loader2 className='h-4 w-4 animate-spin' />
              {t('loading')}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const statCards = [
    {
      title: t('totalClicks'),
      value: analytics.totalClicks,
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: t('totalViews'),
      value: analytics.totalViews,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: t('conversionRate'),
      value: `${(analytics.conversionRate * 100).toFixed(2)}%`,
      icon: Percent,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
  ]

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5'>
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className='border-border/70 bg-card/80 py-0 shadow-sm'
          >
            <CardContent className='flex items-center gap-3 p-3 sm:p-4'>
              <div
                className={cn(
                  'flex-shrink-0 rounded-lg p-2 sm:p-2.5',
                  stat.bgColor,
                )}
              >
                <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', stat.color)} />
              </div>
              <div className='min-w-0'>
                <p className='truncate text-micro font-semibold uppercase tracking-wide text-muted-foreground sm:text-meta'>
                  {stat.title}
                </p>
                <p className='text-heading font-semibold tracking-tight sm:text-title'>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default DashboardPhoneClickStats
