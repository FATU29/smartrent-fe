import React from 'react'

interface ToggleSectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

const ToggleSection: React.FC<ToggleSectionProps> = ({
  icon,
  title,
  children,
}) => {
  return (
    <div className='space-y-2'>
      <div className='text-sm font-medium flex items-center gap-2'>
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

export default ToggleSection
