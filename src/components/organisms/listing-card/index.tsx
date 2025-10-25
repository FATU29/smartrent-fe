import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Property } from '@/api/types/property.type'
import { StatusBadge } from '@/components/atoms/status-badge'
import { PackageBadge } from '@/components/atoms/package-badge'
import { RankDisplay } from '@/components/atoms/rank-display'
import { StatsDisplay } from '@/components/atoms/stats-display'
import { VerificationBadge } from '@/components/atoms/verification-badge'
import { ListingCardActions } from '@/components/molecules/listingCardActions'
import { Card, CardContent } from '@/components/atoms/card'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/date/formatters'
import {
  LISTING_CARD_STYLES,
  LISTING_CARD_CONFIG,
  LISTING_CARD_ANIMATIONS,
  getListingCardLogic,
} from './index.constants'

export interface ListingCardProps {
  property: Property
  onEdit?: () => void
  onPromote?: () => void
  onRepost?: () => void
  onViewReport?: () => void
  onRequestVerification?: () => void
  onCopyListing?: () => void
  onRequestContact?: () => void
  onShare?: () => void
  onActivityHistory?: () => void
  onTakeDown?: () => void
  onDelete?: () => void
  className?: string
}

export const ListingCard: React.FC<ListingCardProps> = ({
  property,
  onEdit,
  onPromote,
  onRepost,
  onViewReport,
  onRequestVerification,
  onCopyListing,
  onRequestContact,
  onShare,
  onActivityHistory,
  onTakeDown,
  onDelete,
  className,
}) => {
  const t = useTranslations('seller.listingManagement.card')
  const logic = getListingCardLogic(property)

  return (
    <Card
      className={cn(
        LISTING_CARD_STYLES.container,
        LISTING_CARD_ANIMATIONS.hover,
        className,
      )}
    >
      <CardContent className='px-4 sm:px-6'>
        <div className={LISTING_CARD_STYLES.layout}>
          {/* Property Image */}
          <div className={LISTING_CARD_STYLES.imageContainer}>
            <Image
              src={property.images?.[0] || LISTING_CARD_CONFIG.defaultImage}
              alt={property.title}
              fill
              className={cn(
                LISTING_CARD_STYLES.image,
                LISTING_CARD_ANIMATIONS.imageHover,
              )}
            />
            {/* Package Badge */}
            {logic.hasPackage && (
              <div className={LISTING_CARD_STYLES.packageBadgeContainer}>
                <PackageBadge
                  packageType={property.package_type!}
                  showShimmer={property.package_type?.startsWith('vip_')}
                />
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className={LISTING_CARD_STYLES.contentContainer}>
            <div className={LISTING_CARD_STYLES.contentLayout}>
              {/* Left Content */}
              <div className={LISTING_CARD_STYLES.leftContent}>
                {/* Title */}
                <h3 className={LISTING_CARD_STYLES.title}>{property.title}</h3>

                {/* Address */}
                <p className={LISTING_CARD_STYLES.address}>
                  {property.property_type} • {property.address}
                </p>

                {/* Property Info */}
                <div className={LISTING_CARD_STYLES.propertyInfo}>
                  <span>
                    {t('listingCode')}: {property.code || property.id}
                  </span>
                  <span>
                    {t('postedDate')}: {formatDate(property.posted_date)}
                  </span>
                  <span>
                    {t('expiryDate')}: {formatDate(property.expiry_date)}
                  </span>
                </div>

                {/* Status Messages */}
                {logic.isExpired && (
                  <p className={LISTING_CARD_STYLES.expiredMessage}>
                    {t('expiredMessage')}
                  </p>
                )}

                {/* Verification and Rank */}
                <div className={LISTING_CARD_STYLES.badgeContainer}>
                  {logic.hasVerification && (
                    <VerificationBadge
                      verified={property.verified}
                      type='verified'
                    />
                  )}
                  {logic.showRank && property.rank && (
                    <RankDisplay rank={property.rank} />
                  )}
                </div>
              </div>

              {/* Right Content - Status + Stats */}
              <div className={LISTING_CARD_STYLES.rightContent}>
                {/* Status Badge */}
                <div className={LISTING_CARD_STYLES.statusContainer}>
                  {property.status && (
                    <StatusBadge
                      status={property.status}
                      animate={property.status === 'expiring'}
                    />
                  )}
                </div>

                {/* Stats */}
                {logic.hasStats && (
                  <div className={LISTING_CARD_STYLES.statsContainer}>
                    <StatsDisplay
                      stats={property.stats!}
                      animated={true}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <ListingCardActions
              onEdit={onEdit}
              onPromote={onPromote}
              onRepost={onRepost}
              onViewReport={onViewReport}
              onRequestVerification={onRequestVerification}
              onCopyListing={onCopyListing}
              onRequestContact={onRequestContact}
              onShare={onShare}
              onActivityHistory={onActivityHistory}
              onTakeDown={onTakeDown}
              onDelete={onDelete}
              showPromoteButton={logic.showPromoteButton}
              showRepostButton={logic.showRepostButton}
            />
          </div>
          {/* Close layout wrapper */}
        </div>
      </CardContent>
    </Card>
  )
}
