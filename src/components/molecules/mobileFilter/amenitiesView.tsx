import React from 'react'
import ToggleChip from '@/components/atoms/mobileFilter/toggleChip'
import { useTranslations } from 'next-intl'

// AmenitiesView
// Multi-select amenity picker implemented with ToggleChips.
// Keeps a constrained allow-list (AMENITY_KEYS) for predictable translation & API mapping.
interface AmenitiesViewProps {
  values?: string[]
  onChange: (vals: string[]) => void
}

const AMENITY_KEYS = [
  'securityService',
  'camera',
  'fireSafety',
  'parking',
  'balcony',
  'garden',
] as const

const AmenitiesView: React.FC<AmenitiesViewProps> = ({
  values = [],
  onChange,
}) => {
  const t = useTranslations('residentialFilter.amenities')

  const toggle = (k: string) => {
    if (values.includes(k)) {
      onChange(values.filter((v) => v !== k))
    } else {
      onChange([...values, k])
    }
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex flex-wrap gap-2'>
        {AMENITY_KEYS.map((k) => (
          <ToggleChip
            key={k}
            label={t(k)}
            active={values.includes(k)}
            onClick={() => toggle(k)}
          />
        ))}
      </div>
      {values.length > 0 && (
        <button
          className='text-xs text-muted-foreground underline'
          type='button'
          onClick={() => onChange([])}
        >
          {t('title')} – reset
        </button>
      )}
    </div>
  )
}

export default AmenitiesView
