import React, { useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ListingDetail } from '@/api/types'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import PropertyCard from '@/components/molecules/propertyCard'
import { PropertyCardSkeleton } from '@/components/molecules/propertyCard/PropertyCardSkeleton'
import { buildApartmentDetailRoute } from '@/constants/route'

interface SellerPublicListingsProps {
  listings: ListingDetail[]
  isLoading?: boolean
}

const SellerPublicListings: React.FC<SellerPublicListingsProps> = ({
  listings,
  isLoading = false,
}) => {
  const t = useTranslations('sellerDetailPage')

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const clickedButton =
      target.closest('[data-action-button]') ||
      target.closest('button') ||
      target.closest('[role="button"]')

    if (clickedButton) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <PropertyCardSkeleton count={6} className='compact' imageLayout='top' />
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className='py-12 text-center'>
          <Typography variant='h4' className='mb-2'>
            {t('states.emptyListingsTitle')}
          </Typography>
          <Typography variant='p' className='text-muted-foreground'>
            {t('states.emptyListingsDescription')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {listings.map((listing) => (
        <Link
          key={listing.listingId}
          href={buildApartmentDetailRoute(listing.listingId.toString())}
          onClick={handleLinkClick}
          className='block h-full'
        >
          <PropertyCard
            listing={listing}
            className='compact'
            imageLayout='top'
          />
        </Link>
      ))}
    </div>
  )
}

export default SellerPublicListings
