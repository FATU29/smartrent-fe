import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Input } from '@/components/atoms/input'
import { Slider } from '@/components/atoms/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/atoms/dropdown-menu'
import { ChevronDown, DollarSign } from 'lucide-react'

interface PriceRangeDropdownProps {
  minPrice?: number
  maxPrice?: number
  onChange: (minPrice: number | undefined, maxPrice: number | undefined) => void
  className?: string
}

const PriceRangeDropdown: React.FC<PriceRangeDropdownProps> = ({
  minPrice,
  maxPrice,
  onChange,
  className = '',
}) => {
  const t = useTranslations('homePage.filters.priceRange')

  const [localMinPrice, setLocalMinPrice] = useState<number>(minPrice || 0)
  const [localMaxPrice, setLocalMaxPrice] = useState<number>(
    maxPrice || 100000000,
  )
  const [sliderValue, setSliderValue] = useState<[number, number]>([
    minPrice || 0,
    maxPrice || 100000000,
  ])

  const minSliderValue = 0
  const maxSliderValue = 100000000

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`
    }
    return price.toString()
  }

  const getDisplayText = () => {
    if (!minPrice && !maxPrice) return t('any')
    if (minPrice && maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)} ${t('currency')}`
    }
    if (minPrice) return `From ${formatPrice(minPrice)} ${t('currency')}`
    if (maxPrice) return `Up to ${formatPrice(maxPrice)} ${t('currency')}`
    return t('any')
  }

  const handleSliderChange = (value: number[]) => {
    const [min, max] = value
    setSliderValue([min, max])
    setLocalMinPrice(min)
    setLocalMaxPrice(max)
  }

  const handleApply = () => {
    onChange(
      localMinPrice === minSliderValue ? undefined : localMinPrice,
      localMaxPrice === maxSliderValue ? undefined : localMaxPrice,
    )
  }

  const handleClear = () => {
    setLocalMinPrice(minSliderValue)
    setLocalMaxPrice(maxSliderValue)
    setSliderValue([minSliderValue, maxSliderValue])
    onChange(undefined, undefined)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={`flex items-center gap-2 h-9 px-3 ${className}`}
        >
          <DollarSign className='h-4 w-4' />
          <Typography variant='small' className='text-sm'>
            {getDisplayText()}
          </Typography>
          <ChevronDown className='h-3 w-3 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-80 p-4'>
        <DropdownMenuLabel className='text-xs font-medium text-muted-foreground mb-3'>
          {t('title')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='mb-4' />

        <div className='space-y-4'>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            min={minSliderValue}
            max={maxSliderValue}
            step={1000000}
            className='w-full'
          />

          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <Typography variant='small' className='text-xs'>
              {formatPrice(minSliderValue)} {t('currency')}
            </Typography>
            <Typography variant='small' className='text-xs'>
              {formatPrice(maxSliderValue)} {t('currency')}
            </Typography>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t('minPrice')}
              </Typography>
              <Input
                type='number'
                value={localMinPrice}
                onChange={(e) =>
                  setLocalMinPrice(parseInt(e.target.value) || 0)
                }
                placeholder='0'
                className='h-8'
              />
            </div>

            <div className='space-y-1'>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t('maxPrice')}
              </Typography>
              <Input
                type='number'
                value={localMaxPrice}
                onChange={(e) =>
                  setLocalMaxPrice(parseInt(e.target.value) || maxSliderValue)
                }
                placeholder='100000000'
                className='h-8'
              />
            </div>
          </div>

          <div className='flex gap-2 pt-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleClear}
              className='flex-1 h-8'
            >
              Clear
            </Button>
            <Button size='sm' onClick={handleApply} className='flex-1 h-8'>
              Apply
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PriceRangeDropdown
