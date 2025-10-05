import React from 'react'

export interface ListingContainerProps {
  children: React.ReactNode
  className?: string
}

export const ListingContainer: React.FC<ListingContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className='mx-auto flex max-w-7xl flex-col gap-6'>{children}</div>
    </div>
  )
}
