import React, { useCallback } from 'react'
import PricingPlanCard, {
  PricingPlanCardSkeleton,
} from '@/components/molecules/pricingPlanCard'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import type { Membership } from '@/api/types/membership.type'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { motion } from 'framer-motion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/atoms/carousel'

interface MembershipPlansGridProps {
  readonly loading?: boolean
  readonly memberships?: readonly Membership[]
  readonly onPlanSelect?: (membershipId: number) => void
}

const SKELETON_COUNT = 3

export const MembershipPlansGrid: React.FC<MembershipPlansGridProps> = ({
  loading = false,
  memberships = [],
  onPlanSelect,
}) => {
  const tPage = useTranslations('membershipPage')
  const isTabletOrBelow = useMediaQuery('(max-width: 1279px)') // xl breakpoint
  const isMobile = useMediaQuery('(max-width: 767px)') // mobile breakpoint

  const handlePlanSelect = useCallback(
    (membershipId: number) => {
      onPlanSelect?.(membershipId)
    },
    [onPlanSelect],
  )

  if (loading) {
    return (
      <span className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <PricingPlanCardSkeleton key={`skeleton-${index}`} />
        ))}
      </span>
    )
  }

  const safeMemberships: readonly Membership[] = Array.isArray(memberships)
    ? memberships
    : (memberships as unknown as { items?: readonly Membership[] })?.items || []

  if (safeMemberships.length === 0) {
    return (
      <span className='flex items-center justify-center py-12'>
        <Typography variant='muted'>{tPage('noPlansAvailable')}</Typography>
      </span>
    )
  }

  // Show carousel for tablet and below
  if (isTabletOrBelow) {
    return (
      <motion.div
        className={isMobile ? 'relative' : 'relative px-12'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className='w-full'
        >
          <CarouselContent className='-ml-2 md:-ml-4'>
            {safeMemberships.map((plan) => (
              <CarouselItem
                key={plan.membershipId}
                className='pl-2 md:pl-4 basis-full md:basis-[90%] lg:basis-[85%]'
              >
                <div className='h-full'>
                  <PricingPlanCard
                    membership={plan}
                    onSelect={() => handlePlanSelect(plan.membershipId)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {!isMobile && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      </motion.div>
    )
  }

  // Show grid for desktop (xl and above)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <motion.div
      className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {safeMemberships.map((plan) => (
        <motion.div
          key={plan.membershipId}
          variants={itemVariants}
          className='flex w-full'
        >
          <PricingPlanCard
            membership={plan}
            onSelect={() => handlePlanSelect(plan.membershipId)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
