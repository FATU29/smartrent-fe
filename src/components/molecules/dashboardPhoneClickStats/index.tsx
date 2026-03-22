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
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>
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
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className='text-right'>
                  <div className='text-3xl font-bold'>{stat.value}</div>
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
