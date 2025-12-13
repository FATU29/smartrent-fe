import React from 'react'
import { useTranslations } from 'next-intl'
import DashboardMembershipCard from '@/components/molecules/dashboardMembershipCard'
import DashboardPhoneClickStats from '@/components/molecules/dashboardPhoneClickStats'
import DashboardPhoneClickChart from '@/components/molecules/dashboardPhoneClickChart'
import DashboardMembershipNavCard from '@/components/molecules/dashboardMembershipNavCard'

const DashboardTemplate: React.FC = () => {
  const t = useTranslations('seller.dashboard')

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {t('title')}
        </h1>
        <p className='text-muted-foreground mt-1'>{t('description')}</p>
      </div>

      {/* Membership Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <DashboardMembershipCard />
        </div>
        <div className='lg:col-span-1'>
          <DashboardMembershipNavCard />
        </div>
      </div>

      {/* Phone Click Statistics */}
      <div className='space-y-6'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>
            {t('phoneClickStats.title')}
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>
            {t('phoneClickStats.description')}
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardPhoneClickStats />

        {/* Chart */}
        <DashboardPhoneClickChart />
      </div>
    </div>
  )
}

export default DashboardTemplate
