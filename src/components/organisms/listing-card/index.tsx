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
import { toYouTubeEmbed } from '@/utils/video/url'
import {
  LISTING_CARD_STYLES,
  LISTING_CARD_CONFIG,
  LISTING_CARD_ANIMATIONS,
} from './index.constants'
import { ListingOwnerDetail, POST_STATUS, PostStatus } from '@/api/types'

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

  const {
    title,
    listingId,
    postDate,
    expiryDate,
    productType,
    expired,
    verified,
    vipType,
    rankOfVipType,
    status,
    listingViews,
    interested,
    customers,
    media,
    address,
  } = property

  // Priority: video -> coverImages
  // Extract video first (isPrimary && mediaType === 'VIDEO')
  const video = media?.find((m) => m.mediaType === 'VIDEO' && m.isPrimary)
  const isYouTubeVideo = video?.sourceType === 'YOUTUBE'
  const videoUrl = video?.url
  const embedUrl = videoUrl && isYouTubeVideo ? toYouTubeEmbed(videoUrl) : null

  // Extract cover image (isPrimary && mediaType === 'IMAGE')
  const coverImage = media?.find((m) => m.mediaType === 'IMAGE' && m.isPrimary)
  const coverImageUrl = coverImage?.url

  // Fallback to first image if no primary cover
  const fallbackImage = media?.find((m) => m.mediaType === 'IMAGE')?.url

  const { fullNewAddress: newAddress, fullAddress: legacyAddress } =
    address || {}
  const displayAddress = newAddress || legacyAddress || 'N/A'

  const isExpired = expired || false
  const hasVipPackage = vipType && vipType !== 'NORMAL'
  const showRank = rankOfVipType > 0
  const showPromoteButton = !hasVipPackage
  const showRepostButton = isExpired

  const packageType = vipType

  type StatusBadgeType =
    | 'active'
    | 'expired'
    | 'expiring'
    | 'pending'
    | 'review'
    | 'payment'
    | 'rejected'
    | 'archived'

  const statusMapping: Record<PostStatus, StatusBadgeType> = {
    [POST_STATUS.ALL]: 'active',
    [POST_STATUS.EXPIRED]: 'expired',
    [POST_STATUS.EXPIRED_SOON]: 'expiring',
    [POST_STATUS.DISPLAYING]: 'active',
    [POST_STATUS.IN_REVIEW]: 'review',
    [POST_STATUS.PENDING_PAYMENT]: 'payment',
    [POST_STATUS.REJECTED]: 'rejected',
    [POST_STATUS.VERIFIED]: 'active',
  }

  const getStatusType = (status?: PostStatus): StatusBadgeType | undefined => {
    if (status === undefined || status === null) return undefined
    return statusMapping[status]
  }

  const statusType = getStatusType(status)

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
          {/* Property Media - Priority: video -> coverImage */}
          <div className={LISTING_CARD_STYLES.imageContainer}>
            {videoUrl ? (
              // Show video if available
              isYouTubeVideo && embedUrl ? (
                // YouTube video - use iframe
                <iframe
                  src={embedUrl}
                  title={title}
                  className='absolute inset-0 w-full h-full object-cover'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  allowFullScreen
                />
              ) : (
                // Uploaded video - use video tag
                <video
                  src={videoUrl}
                  className='absolute inset-0 w-full h-full object-cover'
                  controls
                  preload='metadata'
                />
              )
            ) : (
              // Fallback to cover image or first image
              <Image
                src={
                  coverImageUrl ||
                  fallbackImage ||
                  LISTING_CARD_CONFIG.defaultImage
                }
                alt={title}
                fill
                className={cn(
                  LISTING_CARD_STYLES.image,
                  LISTING_CARD_ANIMATIONS.imageHover,
                )}
              />
            )}
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
                <h3 className={LISTING_CARD_STYLES.title}>{title}</h3>

                {/* Address */}
                <p className={LISTING_CARD_STYLES.address}>
                  {productType} • {displayAddress}
                </p>

                {/* Property Info */}
                <div className={LISTING_CARD_STYLES.propertyInfo}>
                  <span>
                    {t('listingCode')}: {listingId}
                  </span>
                  <span>
                    {t('postedDate')}:{' '}
                    {formatDate(
                      postDate instanceof Date
                        ? postDate.toISOString()
                        : postDate,
                    )}
                  </span>
                  <span>
                    {t('expiryDate')}: {formatDate(expiryDate)}
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
                  {verified && (
                    <VerificationBadge verified={verified} type='verified' />
                  )}
                  {showRank && (
                    <RankDisplay rank={{ page: 1, position: rankOfVipType }} />
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
                {(listingViews || interested || customers) && (
                  <div className={LISTING_CARD_STYLES.statsContainer}>
                    <StatsDisplay
                      stats={{
                        views: listingViews || 0,
                        contacts: interested || 0,
                        customers: customers || 0,
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
