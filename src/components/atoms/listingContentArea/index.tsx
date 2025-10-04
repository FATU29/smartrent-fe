import React from 'react'

export interface ListingContentAreaProps {
  children: React.ReactNode
  minHeight?: string
}

export const ListingContentArea: React.FC<ListingContentAreaProps> = ({
  children,
  minHeight = 'min-h-[300px]',
}) => {
  return <div className={minHeight}>{children}</div>
}
