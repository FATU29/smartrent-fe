import React from 'react'
import { PropertyInfoSection } from '@/components/organisms/createPostSections/propertyInfoSection'

interface PropertyInfoStepProps {
  attemptedSubmit?: boolean
}

export const PropertyInfoStep: React.FC<PropertyInfoStepProps> = ({
  attemptedSubmit,
}) => {
  return <PropertyInfoSection attemptedSubmit={attemptedSubmit} />
}
