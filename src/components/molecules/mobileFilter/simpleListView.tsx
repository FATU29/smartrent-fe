import React from 'react'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'
import { useTranslations } from 'next-intl'
import { ListingFilterRequest, PriceType } from '@/api/types'

// SimpleListView
// Generic radio list for enumerated single-value filters (utilities pricing responsibility).
// 'any' option maps to undefined to simplify active filter counting & API payload.

type UtilityPriceField = 'electricityPrice' | 'waterPrice' | 'internetPrice'

interface SimpleListViewProps {
  type: UtilityPriceField
  value?: ListingFilterRequest[UtilityPriceField]
  onChange: (val?: ListingFilterRequest[UtilityPriceField]) => void
}

const SimpleListView: React.FC<SimpleListViewProps> = ({
  type,
  value,
  onChange,
}) => {
  const t = useTranslations('residentialFilter')

  const options: Array<{ key: string; value?: PriceType }> = [
    { key: 'any', value: undefined },
    { key: 'negotiable', value: 'NEGOTIABLE' },
    { key: 'owner', value: 'SET_BY_OWNER' },
    { key: 'provider', value: 'PROVIDER_RATE' },
  ]

  const filteredOptions =
    type === 'internetPrice'
      ? options.filter((opt) => opt.key !== 'provider')
      : options

  // Handle edge case: if internetPrice has invalid 'PROVIDER_RATE' value, reset it
  React.useEffect(() => {
    if (
      type === 'internetPrice' &&
      value === 'PROVIDER_RATE' &&
      !filteredOptions.some((opt) => opt.value === value)
    ) {
      onChange(undefined)
    }
  }, [type, value, onChange, filteredOptions])

  const titleKey: Record<string, string> = {
    electricityPrice: 'utilitiesPrice.electricity.title',
    waterPrice: 'utilitiesPrice.water.title',
    internetPrice: 'utilitiesPrice.internet.title',
  }

  const prefix =
    type === 'electricityPrice'
      ? 'utilitiesPrice.electricity'
      : type === 'waterPrice'
        ? 'utilitiesPrice.water'
        : 'utilitiesPrice.internet'

  return (
    <div className='pb-20'>
      <div className='text-sm font-medium p-4'>
        {t(titleKey[type] as string)}
      </div>
      {filteredOptions.map((opt) => (
        <RadioRow
          key={opt.key}
          label={t(`${prefix}.${opt.key}` as string)}
          selected={value === opt.value}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  )
}

export default SimpleListView
