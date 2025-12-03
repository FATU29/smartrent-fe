import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import SelectDropdown from '@/components/atoms/select-dropdown'

interface PropertyTypeFilterProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

const PropertyTypeFilter: React.FC<PropertyTypeFilterProps> = ({
  value = 'any',
  onChange,
  className = '',
}) => {
  const t = useTranslations('homePage.filters.propertyType')

  const propertyTypes = [
    { value: 'any', label: t('all') },
    { value: 'room', label: t('room') },
    { value: 'apartment', label: t('apartment') },
    { value: 'house', label: t('house') },
    { value: 'office', label: t('office') },
    { value: 'store', label: t('store') },
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      <Typography variant='h6' className='text-sm font-medium'>
        {t('title')}
      </Typography>
      <SelectDropdown
        value={value}
        onValueChange={onChange}
        placeholder={t('all')}
        options={propertyTypes}
        size='sm'
        variant='default'
      />
    </div>
  )
}

export default PropertyTypeFilter
