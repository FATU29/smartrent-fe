import React from 'react'
import { useTranslations } from 'next-intl'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'
import { ListingFilterRequest, PropertyType } from '@/api/types'

interface PropertyTypeViewProps {
  value?: ListingFilterRequest['productType']
  onChange: (val?: ListingFilterRequest['productType']) => void
}

const PropertyTypeView: React.FC<PropertyTypeViewProps> = ({
  value,
  onChange,
}) => {
  const t = useTranslations('residentialFilter.propertyType')

  type PropertyTypeKey = 'any' | 'apartment' | 'house' | 'room' | 'studio'

  const propertyTypes: Array<{
    key: PropertyTypeKey
    value?: PropertyType
  }> = [
    { key: 'any', value: undefined },
    { key: 'apartment', value: 'APARTMENT' },
    { key: 'house', value: 'HOUSE' },
    { key: 'room', value: 'ROOM' },
    { key: 'studio', value: 'STUDIO' },
  ]

  return (
    <div className='pb-20'>
      <div className='space-y-1'>
        {propertyTypes.map((pt) => (
          <RadioRow
            key={pt.key}
            label={t(pt.key)}
            selected={value === pt.value}
            onClick={() => onChange(pt.value)}
          />
        ))}
      </div>
    </div>
  )
}

export default PropertyTypeView
