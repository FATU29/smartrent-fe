import React from 'react'

interface MapClusterProps {
  count: number
  ariaLabel: string
  onClick?: () => void
}

// Cluster bubble shown in place of several markers that sit close enough to
// overlap. Clicking it zooms in so the underlying listings spread apart.
const MapCluster: React.FC<MapClusterProps> = ({
  count,
  ariaLabel,
  onClick,
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={ariaLabel}
      className='flex items-center justify-center h-10 w-10 rounded-full border-2 border-white bg-primary text-primary-foreground text-sm font-semibold shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer'
    >
      {count}
    </button>
  )
}

export default MapCluster
