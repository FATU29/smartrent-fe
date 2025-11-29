import React from 'react'
import { Check } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { getContentStyles, getFeatureItemStyles } from './styles'
import type { MembershipBenefit } from '@/api/types/membership.type'

interface FeatureIconProps {
  readonly active: boolean
}

/**
 * FeatureIcon component using lucide-react Check icon
 * Displays active/inactive state for pricing features
 */
const FeatureIcon: React.FC<FeatureIconProps> = ({ active }) => {
  return (
    <Check
      className={cn(
        'size-4 shrink-0',
        active ? 'text-emerald-500' : 'text-muted-foreground opacity-30',
      )}
    />
  )
}

interface PricingFeaturesProps {
  readonly benefits: readonly MembershipBenefit[]
  readonly compact: boolean
}

/**
 * PricingFeatures component
 * Renders feature groups with titles and feature lists
 * Uses Typography atoms instead of raw HTML tags
 */
export const PricingFeatures: React.FC<PricingFeaturesProps> = ({
  benefits,
  compact,
}) => {
  return (
    <Typography as='div' className={getContentStyles(compact)}>
      <Typography as='div' className='flex flex-col gap-2'>
        {benefits.map((b, i) => (
          <Typography
            key={i}
            as='div'
            className={getFeatureItemStyles(compact)}
          >
            <FeatureIcon active={true} />
            <Typography as='span'>{b.benefitNameDisplay || ''}</Typography>
          </Typography>
        ))}
      </Typography>
    </Typography>
  )
}
