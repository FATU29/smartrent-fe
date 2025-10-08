import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface LocationCardProps {
  name: string
  image: string
  listingCount: number
  listingSuffix: string
  onClick?: () => void
  large?: boolean
  className?: string
}

const LocationCard: React.FC<LocationCardProps> = ({
  name,
  image,
  listingCount,
  listingSuffix,
  onClick,
  large = false,
  className,
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-md text-left group focus:outline-none focus:ring-2 focus:ring-primary transition',
        large ? 'h-72 md:h-80 col-span-2' : 'h-40',
        'bg-muted w-full',
        className,
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        className='object-cover group-hover:scale-105 transition-transform duration-500'
        sizes='(min-width: 1024px) 33vw, 100vw'
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10' />
      <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white'>
        <div className='font-semibold text-base sm:text-lg mb-1'>{name}</div>
        <div className='text-xs sm:text-sm opacity-90'>
          {listingCount.toLocaleString()} {listingSuffix}
        </div>
      </div>
    </button>
  )
}

export default LocationCard
