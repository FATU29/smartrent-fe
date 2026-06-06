import React from 'react'
import { Badge } from '@/components/atoms/badge'
import { formatByLocale } from '@/utils/currency/convert'
import { VipType, LISTING_TYPE } from '@/api/types/property.type'
import type { listingType as ListingPostType } from '@/api/types/property.type'
import { Crown, Sparkles, Star } from 'lucide-react'

interface MapMarkerProps {
  price: number
  vipType: VipType
  listingType?: ListingPostType
  isSelected?: boolean
  onClick?: () => void
}

interface ListingTypeStyle {
  badge: string
  text: string
  arrow: string
}

// Color the marker by the listing type so rent vs share posts are
// distinguishable at a glance. The VIP tier is shown via the leading icon.
const getListingTypeStyle = (
  listingType?: ListingPostType,
): ListingTypeStyle => {
  switch (listingType) {
    case LISTING_TYPE.SHARE:
      return {
        badge: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700',
        text: 'text-white',
        arrow: 'border-t-emerald-600',
      }
    case LISTING_TYPE.RENT:
      return {
        badge: 'bg-blue-600 hover:bg-blue-700 border-blue-700',
        text: 'text-white',
        arrow: 'border-t-blue-600',
      }
    default:
      return {
        badge: 'bg-card hover:bg-muted border-border',
        text: 'text-foreground',
        arrow: 'border-t-card',
      }
  }
}

const getVipIcon = (vipType: VipType) => {
  switch (vipType) {
    case 'DIAMOND':
      return <Sparkles className='h-3 w-3' />
    case 'GOLD':
      return <Crown className='h-3 w-3' />
    case 'SILVER':
      return <Star className='h-3 w-3' />
    default:
      return null
  }
}

const MapMarker: React.FC<MapMarkerProps> = ({
  price,
  vipType,
  listingType,
  isSelected = false,
  onClick,
}) => {
  const style = getListingTypeStyle(listingType)
  const vipIcon = getVipIcon(vipType)
  const formattedPrice = formatByLocale(price, 'vi-VN')

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`relative cursor-pointer transition-all duration-200 transform ${
        isSelected ? 'scale-110' : 'hover:scale-105'
      }`}
    >
      <Badge
        className={`
          ${style.badge} ${style.text}
          border-2 shadow-lg flex items-center gap-1 px-2 py-1
          ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        `}
      >
        {vipIcon}
        <span className='font-semibold text-xs whitespace-nowrap'>
          {formattedPrice}
        </span>
      </Badge>
      {/* Arrow pointing down */}
      <div
        className={`
          absolute left-1/2 -bottom-1 transform -translate-x-1/2
          w-0 h-0 border-l-4 border-r-4 border-t-4
          border-l-transparent border-r-transparent
          ${style.arrow}
        `}
      />
    </div>
  )
}

export default MapMarker
