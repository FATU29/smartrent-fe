import React from 'react'
import { Check } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <Typography as='div' className={getContentStyles(compact)}>
      <motion.div
        className='flex flex-col gap-2'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            className={getFeatureItemStyles(compact)}
            variants={itemVariants}
          >
            <FeatureIcon active={true} />
            <Typography as='span'>{b.benefitNameDisplay || ''}</Typography>
          </motion.div>
        ))}
      </motion.div>
    </Typography>
  )
}
