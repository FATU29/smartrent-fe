import React from 'react'
import { Users, Home } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/atoms/tabs'
import { useTranslations } from 'next-intl'

interface TabHeaderProps {
  totalCustomers: number
  totalListings: number
}

const TabHeader: React.FC<TabHeaderProps> = ({
  totalCustomers,
  totalListings,
}) => {
  const t = useTranslations('seller.customers')

  return (
    <TabsList className='w-full h-auto rounded-none p-2 bg-gray-50 border-b'>
      <TabsTrigger
        value='customers'
        className='flex-1 gap-2 data-[state=active]:bg-white'
      >
        <Users size={18} />
        <span>
          {t('tabs.customers')} ({totalCustomers})
        </span>
      </TabsTrigger>
      <TabsTrigger
        value='listings'
        className='flex-1 gap-2 data-[state=active]:bg-white'
      >
        <Home size={18} />
        <span>
          {t('tabs.listings')} ({totalListings})
        </span>
      </TabsTrigger>
    </TabsList>
  )
}

export default TabHeader
