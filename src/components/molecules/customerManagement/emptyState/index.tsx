import React from 'react'
import { Users, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EmptyStateProps {
  type: 'customers' | 'listings'
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const t = useTranslations('seller.customers')

  const Icon = type === 'customers' ? Users : FileText
  const title =
    type === 'customers'
      ? t('emptyState.customers.title')
      : t('emptyState.listings.title')
  const description =
    type === 'customers'
      ? t('emptyState.customers.description')
      : t('emptyState.listings.description')

  return (
    <div className='flex flex-col items-center justify-center py-12 px-4'>
      <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
        <Icon size={32} className='text-muted-foreground' />
      </div>
      <h3 className='text-lg font-semibold text-foreground mb-2'>{title}</h3>
      <p className='text-sm text-muted-foreground text-center max-w-sm'>
        {description}
      </p>
    </div>
  )
}

export default EmptyState
