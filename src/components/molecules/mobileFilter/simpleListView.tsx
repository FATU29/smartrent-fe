import React from 'react'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'
import { useTranslations } from 'next-intl'
import { ListingFilterRequest, PriceType } from '@/api/types'

type UtilityPriceField =
  | 'electricityPrice'
  | 'waterPrice'
  | 'internetPrice'
  | 'serviceFee'

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
    { key: 'negotiable', value: 'NEGOTIABLE' },
    { key: 'owner', value: 'SET_BY_OWNER' },
    { key: 'provider', value: 'PROVIDER_RATE' },
  ]

  const titleKey: Record<string, string> = {
    electricityPrice: 'utilitiesPrice.electricity.title',
    waterPrice: 'utilitiesPrice.water.title',
    internetPrice: 'utilitiesPrice.internet.title',
    serviceFee: 'utilitiesPrice.serviceFee.title',
  }

  return (
    <div className='pb-20'>
      <div className='text-sm font-medium p-4'>
        {t(titleKey[type] as string)}
      </div>
      {options.map((opt) => {
        const baseKey =
          type === 'serviceFee'
            ? 'utilitiesPrice.serviceFee'
            : `utilitiesPrice.${type === 'electricityPrice' ? 'electricity' : type === 'waterPrice' ? 'water' : 'internet'}`
        return (
          <RadioRow
            key={opt.key}
            label={t(`${baseKey}.${opt.key}` as string)}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        )
      })}
    </div>
  )
}

export default SimpleListView
