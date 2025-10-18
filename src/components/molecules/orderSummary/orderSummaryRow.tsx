import React from 'react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'

interface OrderSummaryRowProps {
  label: string
  value: string | React.ReactNode
  variant?: 'default' | 'highlight' | 'total'
  className?: string
}

const OrderSummaryRow: React.FC<OrderSummaryRowProps> = ({
  label,
  value,
  variant = 'default',
  className,
}) => {
  const isTotal = variant === 'total'
  const isHighlight = variant === 'highlight'

  return (
    <Card
      className={cn(
        'flex justify-between items-center border-0 shadow-none p-0',
        isTotal && 'pt-3',
        className,
      )}
    >
      <Typography
        variant={isTotal ? 'large' : 'muted'}
        className={cn(
          'text-sm',
          isTotal && 'font-semibold text-foreground',
          isHighlight && 'font-medium text-foreground',
        )}
      >
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography
          className={cn(
            'font-medium text-sm',
            isTotal && 'text-2xl font-bold text-primary',
            isHighlight && 'font-semibold',
          )}
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Card>
  )
}

export { OrderSummaryRow }
export type { OrderSummaryRowProps }
