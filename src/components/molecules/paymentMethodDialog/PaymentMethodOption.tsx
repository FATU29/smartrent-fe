import React from 'react'
import { Check } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import type { PaymentProvider } from '@/api/types/membership.type'

interface PaymentMethodOptionProps {
  readonly provider: PaymentProvider
  readonly label: string
  readonly logo: React.ReactNode
  readonly selected: boolean
  readonly onSelect: (provider: PaymentProvider) => void
}

export const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({
  provider,
  label,
  logo,
  selected,
  onSelect,
}) => {
  return (
    <button
      type='button'
      onClick={() => onSelect(provider)}
      className={cn(
        'relative flex items-center gap-4 w-full p-4 rounded-lg border-2 transition-all hover:border-primary/50 hover:bg-accent/50',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-background',
      )}
    >
      <Typography
        as='div'
        className='flex-shrink-0 w-16 h-16 flex items-center justify-center'
      >
        {logo}
      </Typography>
      <Typography as='div' className='flex-1 text-left'>
        <Typography as='span' className='font-medium text-foreground'>
          {label}
        </Typography>
      </Typography>
      {selected && (
        <Typography as='div' className='flex-shrink-0'>
          <Check className='size-5 text-primary' />
        </Typography>
      )}
    </button>
  )
}
