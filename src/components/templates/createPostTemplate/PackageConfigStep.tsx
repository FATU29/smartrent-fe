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
      className={`w-full mx-auto md:max-w-7xl border-0 shadow-none p-0 ${className || ''}`}
    >
      <Card className='bg-card rounded-lg shadow-sm border p-6 sm:p-8'>
        <PackageConfigSection className='w-full' />
      </Card>
    </Card>
  )
}
