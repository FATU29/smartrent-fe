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
import { useCategories } from '@/hooks/useCategories'

interface CategoryDropdownProps {
  value?: string // categoryId as string (e.g., "1", "2", or "all")
  onChange: (value: string) => void // Returns categoryId as string or "all"
  className?: string
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const t = useTranslations('homePage.filters.propertyType')
  const { data } = useCategories()
  const categories = data?.categories ?? []

  // Add "Tất cả" option first, then map categories
  const categoryOptions = [
    {
      value: 'all',
      displayValue: t('all'), // "Tất cả" / "All Types"
      label: t('all'),
      icon: Home,
    },
    ...categories.map((category) => ({
      value: category.categoryId.toString(),
      displayValue: category.name,
      label: category.name,
      icon: Home,
    })),
  ]

  const selectedType =
    categoryOptions.find((opt) => opt.value === value) || categoryOptions[0]

  // Display translated category name on UI
  const displayText = selectedType.displayValue

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={`flex items-center gap-2 h-9 px-3 ${className}`}
        >
          <selectedType.icon className='h-4 w-4' />
          <Typography variant='small' className='text-sm'>
            {displayText}
          </Typography>
          <ChevronDown className='h-3 w-3 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48'>
        <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
          {t('title')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categoryOptions.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onClick={() => onChange(type.value)}
            className='flex items-center gap-2 cursor-pointer'
          >
            <type.icon className='h-4 w-4' />
            <Typography variant='small' className='text-sm'>
              {type.displayValue}
            </Typography>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CategoryDropdown
