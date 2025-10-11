import React from 'react'
import { Users, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DetailEmptyStateProps {
  activeTab: 'customers' | 'listings'
}

const DetailEmptyState: React.FC<DetailEmptyStateProps> = ({ activeTab }) => {
  const t = useTranslations('seller.customers')

  return (
    <div className='flex items-center justify-center w-full h-full'>
      <div className='text-center'>
        <div className='w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center'>
          {activeTab === 'customers' ? (
            <Users size={32} className='text-muted-foreground' />
          ) : (
            <Home size={32} className='text-muted-foreground' />
          )}
        </div>
        <p className='text-muted-foreground'>{t('selectToView')}</p>
      </div>
    </div>
  )
}

export default DetailEmptyState
