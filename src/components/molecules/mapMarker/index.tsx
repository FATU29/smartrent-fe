import React from 'react'
import { Badge } from '@/components/atoms/badge'
import { formatByLocale } from '@/utils/currency/convert'
import { VipType } from '@/api/types/property.type'
import { Crown, Sparkles, Star } from 'lucide-react'

interface MapMarkerProps {
  price: number
  vipType: VipType
  isSelected?: boolean
  onClick?: () => void
}

interface VipStyle {
  badge: string
  text: string
  arrow: string
  icon: React.ReactNode
}

// Color the marker by VIP tier (diamond / gold / silver) so premium posts
// stand out on the map; normal posts use the neutral card surface.
const getVipStyle = (vipType: VipType): VipStyle => {
  switch (vipType) {
    case 'DIAMOND':
      return {
        badge: 'bg-blue-600 hover:bg-blue-700 border-blue-700',
        text: 'text-white',
        arrow: 'border-t-blue-600',
        icon: <Sparkles className='h-3 w-3' />,
      }
    case 'GOLD':
      return {
        badge: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600',
        text: 'text-white',
        arrow: 'border-t-yellow-500',
        icon: <Crown className='h-3 w-3' />,
      }
    case 'SILVER':
      return {
        badge: 'bg-gray-400 hover:bg-gray-500 border-gray-500',
        text: 'text-white',
        arrow: 'border-t-gray-400',
        icon: <Star className='h-3 w-3' />,
      }
    default:
      return {
        badge: 'bg-card hover:bg-muted border-border',
        text: 'text-foreground',
        arrow: 'border-t-card',
        icon: null,
      }
  }
}

const MapMarker: React.FC<MapMarkerProps> = ({
  price,
  vipType,
  isSelected = false,
  onClick,
}) => {
  const style = getVipStyle(vipType)
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
        {style.icon}
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
