import React from 'react'
import { Badge } from '@/components/atoms/badge'
import { formatByLocale } from '@/utils/currency/convert'
import { VipType } from '@/api/types'
import { Crown, Sparkles, Star } from 'lucide-react'

interface MapMarkerProps {
  price: number
  vipType: VipType
  isSelected?: boolean
  onClick?: () => void
}

const getVipConfig = (vipType: VipType) => {
  switch (vipType) {
    case 'DIAMOND':
      return {
        color: 'bg-blue-600 hover:bg-blue-700 border-blue-700',
        icon: <Sparkles className='h-3 w-3' />,
        textColor: 'text-white',
      }
    case 'GOLD':
      return {
        color: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600',
        icon: <Crown className='h-3 w-3' />,
        textColor: 'text-white',
      }
    case 'SILVER':
      return {
        color: 'bg-gray-400 hover:bg-gray-500 border-gray-500',
        icon: <Star className='h-3 w-3' />,
        textColor: 'text-white',
      }
    default:
      return {
        color: 'bg-white hover:bg-gray-50 border-gray-300',
        icon: null,
        textColor: 'text-gray-900',
      }
  }
}

const MapMarker: React.FC<MapMarkerProps> = ({
  price,
  vipType,
  isSelected = false,
  onClick,
}) => {
  const config = getVipConfig(vipType)
  const formattedPrice = formatByLocale(price, 'vi-VN')

  // Determine arrow border color based on vipType
  const getArrowBorderColor = () => {
    if (vipType === 'DIAMOND') return 'border-t-blue-600'
    if (vipType === 'GOLD') return 'border-t-yellow-500'
    if (vipType === 'SILVER') return 'border-t-gray-400'
    return 'border-t-white'
  }

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
      className={`
        relative cursor-pointer transition-all duration-200 transform
        ${isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-10'}
      `}
    >
      <Badge
        className={`
          ${config.color} ${config.textColor}
          border-2 shadow-lg flex items-center gap-1 px-2 py-1
          ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        `}
      >
        {config.icon}
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
          ${getArrowBorderColor()}
        `}
      />
    </div>
  )
}

export default MapMarker
