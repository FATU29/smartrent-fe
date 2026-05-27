import React from 'react'
import { Card } from '@/components/atoms/card'
import { PackageConfigSection } from '@/components/organisms/createPostSections/packageConfigSection'

interface PackageConfigStepProps {
  className?: string
}

export const PackageConfigStep: React.FC<PackageConfigStepProps> = ({
  className,
}) => {
  return (
    <Card
      className={`w-full mx-auto md:max-w-7xl border-0 shadow-none bg-transparent p-0 ${className || ''}`}
    >
      <Card className='border-0 shadow-none bg-transparent rounded-none p-0 sm:bg-card sm:rounded-lg sm:shadow-sm sm:border sm:p-8'>
        <PackageConfigSection className='w-full' />
      </Card>
    </Card>
  )
}
