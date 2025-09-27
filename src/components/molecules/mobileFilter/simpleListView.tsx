import React from 'react'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'
import { useTranslations } from 'next-intl'

// SimpleListView
// Generic radio list for enumerated single-value filters (move-in time & utilities pricing responsibility).
// 'any' option maps to undefined to simplify active filter counting & API payload.
interface SimpleListViewProps {
  type: 'moveInTime' | 'electricityPrice' | 'waterPrice' | 'internetPrice'
  value?: string
  onChange: (val?: string) => void
}

const SimpleListView: React.FC<SimpleListViewProps> = ({
  type,
  value,
  onChange,
}) => {
  const t = useTranslations('residentialFilter')

  const keyMap: Record<string, string[]> = {
    moveInTime: ['any', 'immediate', 'oneToTwoWeeks', 'oneMonth', 'negotiable'],
    electricityPrice: ['any', 'negotiable', 'owner', 'provider'],
    waterPrice: ['any', 'negotiable', 'owner', 'provider'],
    internetPrice: ['any', 'negotiable', 'owner'],
  }

  const titleKey: Record<string, string> = {
    moveInTime: 'moveInTime.title',
    electricityPrice: 'utilitiesPrice.electricity.title',
    waterPrice: 'utilitiesPrice.water.title',
    internetPrice: 'utilitiesPrice.internet.title',
  }

  const prefix =
    type === 'moveInTime'
      ? 'moveInTime'
      : type === 'electricityPrice'
        ? 'utilitiesPrice.electricity'
        : type === 'waterPrice'
          ? 'utilitiesPrice.water'
          : 'utilitiesPrice.internet'

  return (
    <div className='pb-20'>
      <div className='text-sm font-medium p-4'>
        {t(titleKey[type] as string)}
      </div>
      {keyMap[type].map((k) => (
        <RadioRow
          key={k}
          label={t(`${prefix}.${k}` as string)}
          selected={(value ?? 'any') === k}
          onClick={() => onChange(k === 'any' ? undefined : k)}
        />
      ))}
    </div>
  )
}

export default SimpleListView
