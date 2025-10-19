import React from 'react'
import { Check } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { PricingPlanFeatureGroup } from './index'
import {
  getContentStyles,
  getFeatureGroupTitleStyles,
  getFeatureItemStyles,
} from './styles'

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
  readonly featureGroups: readonly PricingPlanFeatureGroup[]
  readonly compact: boolean
}

/**
 * PricingFeatures component
 * Renders feature groups with titles and feature lists
 * Uses Typography atoms instead of raw HTML tags
 */
export const PricingFeatures: React.FC<PricingFeaturesProps> = ({
  featureGroups,
  compact,
}) => {
  return (
    <Typography as='div' className={getContentStyles(compact)}>
      {featureGroups.map((group, gi) => (
        <Typography key={gi} as='div' className='flex flex-col gap-3'>
          {group.title && (
            <Typography
              variant='small'
              as='p'
              className={getFeatureGroupTitleStyles(compact)}
            >
              {group.title}
            </Typography>
          )}
          <Typography as='div' className='flex flex-col gap-2'>
            {group.features.map((f, fi) => (
              <Typography
                key={fi}
                as='div'
                className={getFeatureItemStyles(compact)}
              >
                <FeatureIcon active={f.active} />
                <Typography
                  as='span'
                  className={cn(
                    !f.active &&
                      'text-muted-foreground line-through opacity-60',
                  )}
                >
                  {f.label}
                </Typography>
              </Typography>
            ))}
          </Typography>
        </Typography>
      ))}
    </Typography>
  )
}
