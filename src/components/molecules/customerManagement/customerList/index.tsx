import React from 'react'
import { Customer } from '@/api/types/customer.type'
import CustomerCard from '../customerCard'
import CustomerCardSkeleton from '../customerCardSkeleton'
import EmptyState from '../emptyState'

interface CustomerListProps {
  customers: Customer[]
  selectedCustomerId: string | null
  isLoading: boolean
  onCustomerSelect: (customer: Customer) => void
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  selectedCustomerId,
  isLoading,
  onCustomerSelect,
}) => {
  if (isLoading) {
    return (
      <>
        <CustomerCardSkeleton />
        <CustomerCardSkeleton />
        <CustomerCardSkeleton />
      </>
    )
  }

  if (customers.length === 0) {
    return <EmptyState type='customers' />
  }

  return (
    <>
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          isSelected={selectedCustomerId === customer.id}
          onClick={() => onCustomerSelect(customer)}
        />
      ))}
    </>
  )
}

export default CustomerList
