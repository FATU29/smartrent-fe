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
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { SortKey } from '@/api/types'

interface SortDropdownProps {
  value?: SortKey
  onChange: (value: SortKey) => void
  className?: string
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  value = SortKey.DEFAULT,
  onChange,
  className = '',
}) => {
  const tSort = useTranslations('propertiesPage.sort')

  const sortOptions = [
    {
      value: SortKey.DEFAULT,
      label: tSort('default'),
    },
    {
      value: SortKey.PRICE_ASC,
      label: tSort('priceAsc'),
    },
    {
      value: SortKey.PRICE_DESC,
      label: tSort('priceDesc'),
    },
    {
      value: SortKey.NEWEST,
      label: tSort('newest'),
    },
    {
      value: SortKey.OLDEST,
      label: tSort('oldest'),
    },
  ]

  const selectedSort =
    sortOptions.find((opt) => opt.value === value) || sortOptions[0]
  const displayText = selectedSort.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={`flex items-center gap-2 h-9 px-3 ${className}`}
        >
          <ArrowUpDown className='h-4 w-4' />
          <Typography variant='small' className='text-sm'>
            {displayText}
          </Typography>
          <ChevronDown className='h-3 w-3 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48'>
        <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
          {tSort('title') || 'Sắp xếp'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className='flex items-center gap-2 cursor-pointer'
          >
            <Typography variant='small' className='text-sm'>
              {option.label}
            </Typography>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SortDropdown
