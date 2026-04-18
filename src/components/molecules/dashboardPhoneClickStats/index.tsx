import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Phone, Eye, Percent, Loader2 } from 'lucide-react'
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
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'>
        {[1, 2, 3].map((i) => (
          <Card key={i} className='border-border/70 bg-card/80'>
            <CardHeader>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin inline mr-2' />
                {t('loading')}
              </CardTitle>
            </CardHeader>
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
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'>
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className='border-border/70 bg-card/80 shadow-sm'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className={`rounded-xl p-2.5 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                    {stat.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default DashboardPhoneClickStats
