import React from 'react'
import { useTranslations } from 'next-intl'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'
import { ListingFilterRequest } from '@/api/types'

// OrientationView
// Grid selection for property orientation; 'any' collapses to undefined.
interface OrientationViewProps {
  value?: ListingFilterRequest['direction']
  onChange: (val?: ListingFilterRequest['direction']) => void
}

const OrientationView: React.FC<OrientationViewProps> = ({
  value,
  onChange,
}) => {
  const t = useTranslations('residentialFilter.orientation')

  type DirectionKey =
    | 'any'
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'northeast'
    | 'northwest'
    | 'southeast'
    | 'southwest'

  const directions: Array<{
    key: DirectionKey
    value?: ListingFilterRequest['direction']
  }> = [
    { key: 'any', value: undefined },
    { key: 'north', value: 'NORTH' },
    { key: 'south', value: 'SOUTH' },
    { key: 'east', value: 'EAST' },
    { key: 'west', value: 'WEST' },
    { key: 'northeast', value: 'NORTHEAST' },
    { key: 'northwest', value: 'NORTHWEST' },
    { key: 'southeast', value: 'SOUTHEAST' },
    { key: 'southwest', value: 'SOUTHWEST' },
  ]

  return (
    <div className='pb-20'>
      <div className='grid grid-cols-2'>
        {directions.map((d) => (
          <RadioRow
            key={d.key}
            label={t(d.key)}
            selected={value === d.value}
            onClick={() => onChange(d.value)}
            dense
          />
        ))}
      </div>
    </div>
  )
}

export default OrientationView
