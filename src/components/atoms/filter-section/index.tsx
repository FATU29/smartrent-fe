import React from 'react'

export interface FilterSectionProps {
  label: string
  children: React.ReactNode
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  label,
  children,
}) => (
  <div className='space-y-2 px-0'>
    <div className='text-sm font-medium pl-0'>{label}</div>
    {children}
  </div>
)
