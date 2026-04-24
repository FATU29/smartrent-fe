import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  /** Optional right-side content (count badge, action button, etc.) */
  children?: React.ReactNode
  className?: string
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  children,
  className,
}) => (
  <div className={cn('flex items-center justify-between', className)}>
    <h2 className='text-base sm:text-lg font-bold pl-2.5 border-l-[3px] border-primary leading-tight'>
      {title}
    </h2>
    {children}
  </div>
)

export default SectionHeading
