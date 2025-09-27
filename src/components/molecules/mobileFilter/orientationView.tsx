import React from 'react'
import { useTranslations } from 'next-intl'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'

// OrientationView
// Grid selection for property orientation; 'any' collapses to undefined.
interface OrientationViewProps {
  value?: string
  onChange: (val?: string) => void
}

const OrientationView: React.FC<OrientationViewProps> = ({
  value,
  onChange,
}) => {
  const t = useTranslations('residentialFilter.orientation')
  const keys = [
    'any',
    'north',
    'south',
    'east',
    'west',
    'northeast',
    'northwest',
    'southeast',
    'southwest',
  ] as const

  return (
    <div className='pb-20'>
      <div className='grid grid-cols-2'>
        {keys.map((k) => (
          <RadioRow
            key={k}
            label={t(k)}
            selected={(value ?? 'any') === k}
            onClick={() => onChange(k === 'any' ? undefined : k)}
            dense
          />
        ))}
      </div>
    </div>
  )
}

export default OrientationView
