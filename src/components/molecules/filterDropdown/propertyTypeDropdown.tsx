import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/atoms/dropdown-menu'
import { ChevronDown, Home } from 'lucide-react'
import { PROPERTY_TYPES } from '@/constants/common/propertyTypes'

interface PropertyTypeDropdownProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

const PropertyTypeDropdown: React.FC<PropertyTypeDropdownProps> = ({
  value = 'tat-ca', // Default to "Tất cả" slug
  onChange,
  className = '',
}) => {
  const t = useTranslations('homePage.filters.propertyType')
  const tCommon = useTranslations('common')

  // Use PROPERTY_TYPES directly (already includes "Tất cả" as first item)
  // Use translation for names, keep slugs as-is
  const propertyTypes = PROPERTY_TYPES.map((type) => ({
    value: type.slug, // Use slug for consistency (no translation)
    label: tCommon(`propertyTypes.${type.id}`), // Use translation by id
    icon: Home,
  }))

  const selectedType =
    propertyTypes.find((type) => type.value === value) || propertyTypes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={`flex items-center gap-2 h-9 px-3 ${className}`}
        >
          <selectedType.icon className='h-4 w-4' />
          <Typography variant='small' className='text-sm'>
            {selectedType.label}
          </Typography>
          <ChevronDown className='h-3 w-3 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48'>
        <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
          {t('title')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {propertyTypes.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onClick={() => onChange(type.value)}
            className='flex items-center gap-2 cursor-pointer'
          >
            <type.icon className='h-4 w-4' />
            <Typography variant='small' className='text-sm'>
              {type.label}
            </Typography>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PropertyTypeDropdown
