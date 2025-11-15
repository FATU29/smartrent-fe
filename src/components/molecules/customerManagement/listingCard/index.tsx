import React from 'react'
import { ListingWithCustomers } from '@/api/types/customer.type'
import { Badge } from '@/components/atoms/badge'
import { Card } from '@/components/atoms/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { formatByLocale } from '@/utils/currency/convert'
import { MapPin, Users, Clock } from 'lucide-react'

interface ListingCardProps {
  listing: ListingWithCustomers
  isSelected?: boolean
  onClick: () => void
  language: string
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSelected,
  onClick,
  language,
}) => {
  const formattedPrice = formatByLocale(listing.price, language)

  return (
    <Card
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 py-3',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'hover:border-primary/50',
      )}
    >
      <div className='flex gap-3'>
        {/* Image */}
        <div className='relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100'>
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className='object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-400'>
              <span className='text-xs'>No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-foreground text-sm line-clamp-2 mb-2'>
            {listing.title}
          </h3>
          <div className='flex items-start gap-1.5 text-xs text-muted-foreground mb-2'>
            <MapPin
              size={12}
              className='text-muted-foreground/70 mt-0.5 shrink-0'
            />
            <p className='line-clamp-1'>{listing.address}</p>
          </div>
          <div className='flex items-center justify-between gap-2 mb-2'>
            <p className='text-sm font-bold text-red-600'>
              {formattedPrice}/{language === 'vi' ? 'tháng' : 'month'}
            </p>
            <Badge variant='outline' className='text-xs'>
              {listing.propertyType}
            </Badge>
          </div>
          <div className='flex items-center justify-between gap-2 pt-2 border-t border-border'>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Users size={12} className='text-muted-foreground/70' />
              <span>{listing.totalInteractions} interactions</span>
            </div>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Clock size={12} className='text-muted-foreground/70' />
              <span>{listing.lastActivity}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ListingCard
