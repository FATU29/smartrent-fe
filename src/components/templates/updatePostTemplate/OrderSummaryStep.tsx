import React from 'react'
import { Card } from '@/components/atoms/card'
import { OrderSummarySection } from '@/components/organisms/updatePostSections/orderSummarySection'

interface OrderSummaryStepProps {
  className?: string
}

export const OrderSummaryStep: React.FC<OrderSummaryStepProps> = ({
  className,
}) => {
  return (
    <Card
      className={`w-full mx-auto md:max-w-5xl border-0 shadow-none p-0 ${className || ''}`}
    >
      <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
        <OrderSummarySection className='w-full' />
      </Card>
    </Card>
  )
}
