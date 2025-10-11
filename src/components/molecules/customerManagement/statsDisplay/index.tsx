import React from 'react'
import { Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StatsDisplayProps {
  totalCount: number
  unviewedCount: number
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  totalCount,
  unviewedCount,
}) => {
  const t = useTranslations('seller.customers')

  return (
    <div className='flex items-center gap-3 shrink-0'>
      {unviewedCount > 0 && (
        <div className='flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full'>
          <div className='w-2 h-2 bg-red-500 rounded-full' />
          <span className='text-red-700 font-medium text-sm'>
            {t('unviewed')}: {unviewedCount}
          </span>
        </div>
      )}
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
