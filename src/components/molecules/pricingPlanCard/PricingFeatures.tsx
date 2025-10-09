import React from 'react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { PricingPlanFeatureGroup } from './index'
import {
  getContentStyles,
  getFeatureGroupTitleStyles,
  getFeatureItemStyles,
} from './styles'

interface FeatureIconProps {
  active: boolean
}

const FeatureIcon: React.FC<FeatureIconProps> = ({ active }) => {
  if (active) {
    return (
      <svg
        className='size-4 shrink-0 text-emerald-500'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M20 6 9 17l-5-5' />
      </svg>
    )
  }
  return (
    <svg
      className='size-4 text-muted-foreground shrink-0'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='m5 12 5 5L20 7' className='opacity-30' />
    </svg>
  )
}

interface PricingFeaturesProps {
  featureGroups: PricingPlanFeatureGroup[]
  compact: boolean
}

export const PricingFeatures: React.FC<PricingFeaturesProps> = ({
  featureGroups,
  compact,
}) => {
  return (
    <div className={getContentStyles(compact)}>
      {featureGroups.map((group, gi) => (
        <div key={gi} className='flex flex-col gap-3'>
          {group.title && (
            <Typography
              variant='small'
              as='h6'
              className={getFeatureGroupTitleStyles(compact)}
            >
              {group.title}
            </Typography>
          )}
          <ul className='flex flex-col gap-2'>
            {group.features.map((f, fi) => (
              <li key={fi} className={getFeatureItemStyles(compact)}>
                <FeatureIcon active={f.active} />
                <span
                  className={cn(
                    !f.active &&
                      'text-muted-foreground line-through opacity-60',
                  )}
                >
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
