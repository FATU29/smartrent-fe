import React from 'react'
import ToggleChip from '@/components/atoms/mobileFilter/toggleChip'
import { useTranslations } from 'next-intl'
import {
  getAmenitiesByCategory,
  type AmenityCategory,
} from '@/constants/amenities'

// AmenitiesView
// Multi-select amenity picker with full list grouped by category
interface AmenitiesViewProps {
  values?: { id: number; name?: string }[] // Array of amenity objects
  onChange: (vals: { id: number; name?: string }[]) => void
}

const AmenitiesView: React.FC<AmenitiesViewProps> = ({
  values = [],
  onChange,
}) => {
  const t = useTranslations('createPost.sections.propertyInfo')
  const tFilter = useTranslations('residentialFilter')

  const toggle = (id: number, name: string) => {
    const isSelected = values.some((v) => v.id === id)
    if (isSelected) {
      onChange(values.filter((v) => v.id !== id))
    } else {
      onChange([...values, { id, name }])
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
                      active={values.some((v) => v.id === amenity.id)}
                      onClick={() => toggle(amenity.id, translatedName)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
        {values.length > 0 && (
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
