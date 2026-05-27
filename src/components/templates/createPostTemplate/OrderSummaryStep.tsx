import React from 'react'
import { Card } from '@/components/atoms/card'
import { OrderSummarySection } from '@/components/organisms/createPostSections/orderSummarySection'

interface OrderSummaryStepProps {
  className?: string
}

export const OrderSummaryStep: React.FC<OrderSummaryStepProps> = ({
  className,
}) => {
  return (
    <Card
      className={`w-full mx-auto md:max-w-5xl border-0 shadow-none bg-transparent p-0 ${className || ''}`}
    >
      <Card className='border-0 shadow-none bg-transparent rounded-none p-0 sm:bg-card sm:rounded-lg sm:shadow-sm sm:border sm:p-8'>
        <OrderSummarySection className='w-full' />
      </Card>
    </Card>
  )
}
