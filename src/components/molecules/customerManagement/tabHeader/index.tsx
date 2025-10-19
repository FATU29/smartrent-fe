import React from 'react'
import { Users, Home } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/atoms/tabs'
import { Badge } from '@/components/atoms/badge'
import { useTranslations } from 'next-intl'

interface TabHeaderProps {
  totalCustomers: number
  totalListings: number
  unviewedCustomersCount: number
  unviewedListingsCount: number
}

const TabHeader: React.FC<TabHeaderProps> = ({
  totalCustomers,
  totalListings,
  unviewedCustomersCount,
  unviewedListingsCount,
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
        {unviewedCustomersCount > 0 && (
          <Badge className='ml-1 bg-red-500 text-white h-5 min-w-[20px] px-1.5'>
            {unviewedCustomersCount}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger
        value='listings'
        className='flex-1 gap-2 data-[state=active]:bg-white'
      >
        <Home size={18} />
        <span>
          {t('tabs.listings')} ({totalListings})
        </span>
        {unviewedListingsCount > 0 && (
          <Badge className='ml-1 bg-red-500 text-white h-5 min-w-[20px] px-1.5'>
            {unviewedListingsCount}
          </Badge>
        )}
      </TabsTrigger>
    </TabsList>
  )
}

export default TabHeader
