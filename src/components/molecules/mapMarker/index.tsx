import React from 'react'
import { VipType } from '@/api/types/property.type'
import { Crown, Sparkles, Star, Home } from 'lucide-react'

interface MapMarkerProps {
  vipType: VipType
  isSelected?: boolean
  onClick?: () => void
}

interface VipStyle {
  bg: string
  hover: string
  arrow: string
  icon: React.ReactNode
}

const ICON_SIZE = 14

// Each marker is just a coloured icon pin (no price/label). Colour and icon
// encode the VIP tier so posts are distinguishable at a glance.
const getVipStyle = (vipType: VipType): VipStyle => {
  switch (vipType) {
    case 'DIAMOND':
      return {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        arrow: 'border-t-blue-600',
        icon: <Sparkles size={ICON_SIZE} />,
      }
    case 'GOLD':
      return {
        bg: 'bg-yellow-500',
        hover: 'hover:bg-yellow-600',
        arrow: 'border-t-yellow-500',
        icon: <Crown size={ICON_SIZE} />,
      }
    case 'SILVER':
      return {
        bg: 'bg-gray-400',
        hover: 'hover:bg-gray-500',
        arrow: 'border-t-gray-400',
        icon: <Star size={ICON_SIZE} />,
      }
    default:
      return {
        bg: 'bg-emerald-600',
        hover: 'hover:bg-emerald-700',
        arrow: 'border-t-emerald-600',
        icon: <Home size={ICON_SIZE} />,
      }
  }
}

const MapMarker: React.FC<MapMarkerProps> = ({
  vipType,
  isSelected = false,
  onClick,
}) => {
  const style = getVipStyle(vipType)

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
        isSelected ? 'scale-125 z-50' : 'hover:scale-110'
      }`}
    >
      {/* Pulsing halo so a focused marker is easy to spot among the others.
          Larger than the pin and centred on it so it clearly radiates outward,
          signalling "this is the listing you picked". */}
      {isSelected && (
        <span
          aria-hidden
          className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 animate-ping ${style.bg}`}
        />
      )}
      <div
        className={`
          relative ${style.bg} ${style.hover}
          flex items-center justify-center h-8 w-8 rounded-full
          border-2 border-white text-white shadow-lg
          ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        `}
      >
        {style.icon}
      </div>
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
