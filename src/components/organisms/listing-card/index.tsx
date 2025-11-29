import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
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
} from './index.constants'
import { ListingOwnerDetail } from '@/api/types'

export interface ListingCardProps {
  property: ListingOwnerDetail
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

  // Derived logic based on ListingOwnerDetail
  const isExpired = property.expired || false
  const hasVipPackage = property.vipType && property.vipType !== 'NORMAL'
  const showRank = property.rankOfVipType > 0
  const showPromoteButton = !hasVipPackage
  const showRepostButton = isExpired

  // VipType is already matching PackageType (NORMAL, SILVER, GOLD, DIAMOND)
  const packageType = property.vipType

  // Map PostStatus to StatusType
  const getStatusType = (status?: string): string | undefined => {
    if (!status) return undefined
    const mapping: Record<string, string> = {
      DISPLAYING: 'active',
      EXPIRED: 'expired',
      NEAR_EXPIRED: 'expiring',
      PENDING_APPROVAL: 'pending',
      APPROVED: 'review',
      PENDING_PAYMENT: 'payment',
      REJECTED: 'rejected',
      VERIFIED: 'active',
      ALL: 'active',
    }
    return mapping[status] || 'pending'
  }

  const statusType = getStatusType(property.status)

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
              src={
                property.assets?.images?.[0] || LISTING_CARD_CONFIG.defaultImage
              }
              alt={property.title}
              fill
              className={cn(
                LISTING_CARD_STYLES.image,
                LISTING_CARD_ANIMATIONS.imageHover,
              )}
            />
            {/* Package Badge */}
            {packageType && (
              <div className={LISTING_CARD_STYLES.packageBadgeContainer}>
                <PackageBadge packageType={packageType} showShimmer={true} />
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
                  {property.productType} •{' '}
                  {property.address?.new || property.address?.legacy || 'N/A'}
                </p>

                {/* Property Info */}
                <div className={LISTING_CARD_STYLES.propertyInfo}>
                  <span>
                    {t('listingCode')}: {property.listingId}
                  </span>
                  <span>
                    {t('postedDate')}:{' '}
                    {formatDate(
                      property.postDate instanceof Date
                        ? property.postDate.toISOString()
                        : property.postDate,
                    )}
                  </span>
                  <span>
                    {t('expiryDate')}: {formatDate(property.expiryDate)}
                  </span>
                </div>

                {/* Status Messages */}
                {isExpired && (
                  <p className={LISTING_CARD_STYLES.expiredMessage}>
                    {t('expiredMessage')}
                  </p>
                )}

                {/* Verification and Rank */}
                <div className={LISTING_CARD_STYLES.badgeContainer}>
                  {property.verified && (
                    <VerificationBadge
                      verified={property.verified}
                      type='verified'
                    />
                  )}
                  {showRank && (
                    <RankDisplay
                      rank={{ page: 1, position: property.rankOfVipType }}
                    />
                  )}
                </div>
              </div>

              {/* Right Content - Status + Stats */}
              <div className={LISTING_CARD_STYLES.rightContent}>
                {/* Status Badge */}
                <div className={LISTING_CARD_STYLES.statusContainer}>
                  {statusType && (
                    <StatusBadge
                      status={
                        statusType as
                          | 'active'
                          | 'expired'
                          | 'expiring'
                          | 'pending'
                          | 'review'
                          | 'payment'
                          | 'rejected'
                          | 'archived'
                      }
                      animate={statusType === 'expiring'}
                    />
                  )}
                </div>

                {/* Stats */}
                {(property.listingViews ||
                  property.interested ||
                  property.customers) && (
                  <div className={LISTING_CARD_STYLES.statsContainer}>
                    <StatsDisplay
                      stats={{
                        views: property.listingViews || 0,
                        contacts: property.interested || 0,
                        customers: property.customers || 0,
                      }}
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
              showPromoteButton={showPromoteButton}
              showRepostButton={showRepostButton}
            />
          </div>
          {/* Close layout wrapper */}
        </div>
      </CardContent>
    </Card>
  )
}
