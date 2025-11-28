import React, { useState, useEffect } from 'react'
import { Slider } from '@/components/atoms/slider'
import { useTranslations } from 'next-intl'

// RangeView
// Shared range slider view for price, area, frontage, and bedroom.
// Converts full-range selection back to undefined to keep query params lean.
interface RangeViewProps {
  type: 'price' | 'area' | 'frontage' | 'bedroom'
  value: { min?: number; max?: number }
  onChange: (value: { min?: number; max?: number }) => void
  unit?: string
}

const defaults = {
  price: { min: 0, max: 100_000_000 },
  area: { min: 0, max: 500 },
  frontage: { min: 0, max: 30 },
  bedroom: { min: 1, max: 10 },
}

const RangeView: React.FC<RangeViewProps> = ({ type, value, onChange }) => {
  const t = useTranslations('residentialFilter')
  const [internal, setInternal] = useState<[number, number]>([
    value.min ?? defaults[type].min,
    value.max ?? defaults[type].max,
  ])

  useEffect(() => {
    setInternal([
      value.min ?? defaults[type].min,
      value.max ?? defaults[type].max,
    ])
  }, [value.min, value.max, type])

  const apply = (vals: [number, number]) => {
    const [min, max] = vals
    onChange({
      min: min === defaults[type].min ? undefined : min,
      max: max === defaults[type].max ? undefined : max,
    })
  }

  const handleInputChange = (idx: 0 | 1, raw: string) => {
    const parsed = raw.replace(/[^0-9]/g, '')
    const num = parsed === '' ? undefined : Number(parsed)
    const next: [number, number] = [...internal]
    if (num === undefined) {
      // do not immediately apply undefined—just reflect placeholder (leave slider extremes)
      if (idx === 0) next[0] = defaults[type].min
      else next[1] = defaults[type].max
      setInternal(next)
      apply(next)
      return
    }
    const limitMin = defaults[type].min
    const limitMax = defaults[type].max
    const clamped = Math.min(Math.max(num, limitMin), limitMax)
    next[idx] = clamped
    // Ensure ordering
    if (next[0] > next[1]) {
      if (idx === 0) next[1] = clamped
      else next[0] = clamped
    }
    setInternal(next)
    apply(next)
  }

  return (
    <div className='p-4 space-y-6'>
      <div className='space-y-2'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium'>
              {t(`${type}.min` as string)}
            </label>
            <input
              type='text'
              inputMode='numeric'
              className='h-9 px-2 rounded border bg-background text-sm'
              value={
                internal[0] === defaults[type].min ? '' : internal[0].toString()
              }
              placeholder={defaults[type].min.toString()}
              onChange={(e) => handleInputChange(0, e.target.value)}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium'>
              {t(`${type}.max` as string)}
            </label>
            <input
              type='text'
              inputMode='numeric'
              className='h-9 px-2 rounded border bg-background text-sm'
              value={
                internal[1] === defaults[type].max ? '' : internal[1].toString()
              }
              placeholder={defaults[type].max.toString()}
              onChange={(e) => handleInputChange(1, e.target.value)}
            />
          </div>
        </div>
        <Slider
          value={internal}
          max={defaults[type].max}
          min={defaults[type].min}
          step={type === 'price' ? 1_000_000 : type === 'bedroom' ? 1 : 5}
          onValueChange={(v) => setInternal(v as [number, number])}
          onValueCommit={(v) => apply(v as [number, number])}
        />
      </div>
      <div className='flex gap-3'>
        <button
          type='button'
          onClick={() => {
            setInternal([defaults[type].min, defaults[type].max])
            onChange({ min: undefined, max: undefined })
          }}
          className='text-sm text-muted-foreground underline'
        >
          {t('actions.clear')}
        </button>
      </div>
    </div>
  )
}

export default RangeView
