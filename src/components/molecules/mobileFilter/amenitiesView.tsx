import React from 'react'
import ToggleChip from '@/components/atoms/mobileFilter/toggleChip'
import { useTranslations } from 'next-intl'
import {
  getAmenitiesByCategory,
  type AmenityCategory,
} from '@/constants/amenities'
import { ListingFilterRequest } from '@/api/types'

interface AmenitiesViewProps {
  value?: ListingFilterRequest['amenityIds']
  onChange: (val: ListingFilterRequest['amenityIds']) => void
}

const AmenitiesView: React.FC<AmenitiesViewProps> = ({
  value = [],
  onChange,
}) => {
  const t = useTranslations('createPost.sections.propertyInfo')
  const tFilter = useTranslations('residentialFilter')

  const toggle = (id: number) => {
    const isSelected = value.includes(id)
    if (isSelected) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const categories: AmenityCategory[] = [
    'BASIC',
    'CONVENIENCE',
    'SECURITY',
    'ENTERTAINMENT',
    'TRANSPORT',
  ]

  const categoryLabels: Record<AmenityCategory, string> = {
    BASIC: tFilter('amenities.categories.basic'),
    CONVENIENCE: tFilter('amenities.categories.convenience'),
    SECURITY: tFilter('amenities.categories.security'),
    ENTERTAINMENT: tFilter('amenities.categories.entertainment'),
    TRANSPORT: tFilter('amenities.categories.transport'),
  }

  return (
    <div className='pb-20'>
      <div className='p-4 space-y-4'>
        <div className='text-sm font-medium'>{tFilter('amenities.title')}</div>
        {categories.map((category) => {
          const categoryAmenities = getAmenitiesByCategory(category)
          if (categoryAmenities.length === 0) return null

          return (
            <div key={category} className='space-y-2'>
              <div className='text-xs font-semibold text-muted-foreground uppercase'>
                {categoryLabels[category]}
              </div>
              <div className='flex flex-wrap gap-2'>
                {categoryAmenities.map((amenity) => {
                  const translatedName = t(
                    `amenities.${amenity.translationKey}`,
                  )
                  return (
                    <ToggleChip
                      key={amenity.id}
                      label={translatedName}
                      active={value.includes(amenity.id)}
                      onClick={() => toggle(amenity.id)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
        {value.length > 0 && (
          <button
            className='text-xs text-muted-foreground underline'
            type='button'
            onClick={() => onChange([])}
          >
            {tFilter('actions.reset')}
          </button>
        )}
      </div>
    </div>
  )
}

export default AmenitiesView
