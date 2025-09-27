import React, { useState } from 'react'
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
import { Ruler, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AreaRangeDropdownProps {
  minArea?: number
  maxArea?: number
  onChange: (minArea: number | undefined, maxArea: number | undefined) => void
  className?: string
}

const AreaRangeDropdown: React.FC<AreaRangeDropdownProps> = ({
  minArea,
  maxArea,
  onChange,
  className = '',
}) => {
  const t = useTranslations('residentialFilter.area')
  const [localMin, setLocalMin] = useState<number>(minArea || 0)
  const [localMax, setLocalMax] = useState<number>(maxArea || 500)
  const [sliderValue, setSliderValue] = useState<[number, number]>([
    minArea || 0,
    maxArea || 500,
  ])

  const minSliderValue = 0
  const maxSliderValue = 500

  const getDisplayText = () => {
    if (!minArea && !maxArea) return t('any')
    if (minArea && maxArea) return `${minArea}-${maxArea} ${t('unit')}`
    if (minArea) return `≥ ${minArea} ${t('unit')}`
    if (maxArea) return `≤ ${maxArea} ${t('unit')}`
    return t('any')
  }

  const handleSliderChange = (value: number[]) => {
    const [min, max] = value
    setSliderValue([min, max])
    setLocalMin(min)
    setLocalMax(max)
  }

  const handleApply = () => {
    onChange(
      localMin === minSliderValue ? undefined : localMin,
      localMax === maxSliderValue ? undefined : localMax,
    )
  }

  const handleClear = () => {
    setLocalMin(minSliderValue)
    setLocalMax(maxSliderValue)
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
          <Ruler className='h-4 w-4' />
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
            step={5}
            className='w-full'
          />

          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <Typography variant='small' className='text-xs'>
              {minSliderValue} {t('unit')}
            </Typography>
            <Typography variant='small' className='text-xs'>
              {maxSliderValue} {t('unit')}
            </Typography>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t('min')}
              </Typography>
              <Input
                type='number'
                value={localMin}
                onChange={(e) => setLocalMin(parseInt(e.target.value) || 0)}
                placeholder='0'
                className='h-8'
              />
            </div>
            <div className='space-y-1'>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t('max')}
              </Typography>
              <Input
                type='number'
                value={localMax}
                onChange={(e) =>
                  setLocalMax(parseInt(e.target.value) || maxSliderValue)
                }
                placeholder={maxSliderValue.toString()}
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

export default AreaRangeDropdown
