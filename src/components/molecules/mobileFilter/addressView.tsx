import React from 'react'
import {
  AddressInput,
  AddressFilterData,
} from '@/components/molecules/filterAddress'

interface AddressViewProps {
  value: AddressFilterData
  onChange: (data: Partial<AddressFilterData>) => void
}

const AddressView: React.FC<AddressViewProps> = ({ value, onChange }) => {
  return (
    <div className='p-4 space-y-4'>
      <AddressInput value={value} onChange={onChange} />
    </div>
  )
}

export default AddressView
