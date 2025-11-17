import React from 'react'
import { Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StatsDisplayProps {
  totalCount: number
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ totalCount }) => {
  const t = useTranslations('seller.customers')

  return (
    <div className='flex items-center gap-3 shrink-0'>
      <div className='flex items-center gap-2'>
        <Activity size={18} className='text-primary' />
        <span className='text-gray-600 font-medium text-sm'>
          {t('total')}: {totalCount}
        </span>
      </div>
    </div>
  )
}

export default StatsDisplay
