import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { RankDisplay } from '@/components/atoms/rank-display'
import { StatsDisplay } from '@/components/atoms/stats-display'
import { VerificationBadge } from '@/components/atoms/verification-badge'
import { Badge } from '@/components/atoms/badge'
import { ListingCardActions } from '@/components/molecules/listingCardActions'
import { Card, CardContent } from '@/components/atoms/card'
import { cn } from '@/lib/utils'
import { toISO, formatISO } from '@/utils/date/safe'
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
  const tNot = useTranslations()

  const {
    title,
    listingId,
    postDate,
    expiryDate,
    durationDays,
    productType,
    expired,
    verified,
    vipType,
    rankOfVipType,
    listingViews,
    interested,
    customers,
    statistics,
    media,
    address,
  } = property

  const calculatedExpiryDate = React.useMemo(() => {
    if (expiryDate) return toISO(expiryDate)
    if (!postDate || !durationDays) return null

    const startISO = toISO(postDate)
    if (!startISO) return null
    const startDate = new Date(startISO)
    const endDate = new Date(
      startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
    )
    return endDate.toISOString()
  }, [postDate, expiryDate, durationDays])

  const viewCount = statistics?.viewCount ?? listingViews ?? 0
  const contactCount = statistics?.contactCount ?? interested ?? 0
  const customerCount = customers ?? 0

  const coverImage = media?.find(
    (m) =>
      m.mediaType === 'IMAGE' &&
      m.isPrimary &&
      m.sourceType !== 'YOUTUBE' &&
      !m.url?.includes('youtube.com') &&
      !m.url?.includes('youtu.be'),
  )
  const coverImageUrl = coverImage?.url

  const { fullNewAddress: newAddress, fullAddress: legacyAddress } =
    address || {}

  const isExpired = expired || false
  const hasVipPackage = vipType && vipType !== 'NORMAL'
  const showRank = rankOfVipType > 0
  const showPromoteButton = !hasVipPackage
  const showRepostButton = isExpired

  // Human readable dates
  const postISO = toISO(postDate)
  const postDisplay = formatISO(postISO)
  const expiryISO = calculatedExpiryDate || toISO(expiryDate)
  const expiryDisplay =
    formatISO(expiryISO) || t('common.notAvailable', { default: 'N/A' })

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
          {/* Property Media - Cover image only (no video for seller/listings page) */}
          <div className={LISTING_CARD_STYLES.imageContainer}>
            {/* VIP Type Badge */}
            {vipType && vipType !== 'NORMAL' && (
              <div className='absolute top-2 left-2 z-10'>
                <Badge
                  variant='default'
                  className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-3 py-1 shadow-lg'
                >
                  {t(`vipTypes.${vipType}`)}
                </Badge>
              </div>
            )}

            {/* Cover Image Only */}
            <Image
              src={coverImageUrl || LISTING_CARD_CONFIG.defaultImage}
              alt={title}
              fill
              className={cn(
                LISTING_CARD_STYLES.image,
                LISTING_CARD_ANIMATIONS.imageHover,
              )}
            />
          </div>

          {/* Property Details */}
          <div className={LISTING_CARD_STYLES.contentContainer}>
            <div className={LISTING_CARD_STYLES.contentLayout}>
              {/* Left Content */}
              <div className={LISTING_CARD_STYLES.leftContent}>
                {/* Title */}
                <h3 className={LISTING_CARD_STYLES.title}>{title}</h3>

                {/* Address */}
                <p className={LISTING_CARD_STYLES.address}>{productType}</p>

                {/* Address List - Show both new and legacy */}
                <ul className='list-disc pl-5 text-sm text-gray-600 mb-2'>
                  {newAddress && (
                    <li>
                      {tNot('apartmentDetail.property.newAddress', {
                        default: 'New Address',
                      })}
                      : {newAddress}
                    </li>
                  )}
                  {legacyAddress && (
                    <li>
                      {tNot('apartmentDetail.property.legacyAddress', {
                        default: 'Legacy Address',
                      })}
                      : {legacyAddress}
                    </li>
                  )}
                  {!newAddress && !legacyAddress && <li>N/A</li>}
                </ul>

                {/* Property Info */}
                <div className={LISTING_CARD_STYLES.propertyInfo}>
                  <span>
                    {t('listingCode')}: {listingId}
                  </span>
                  {postDisplay && (
                    <span>
                      {t('postDate')}: {postDisplay}
                    </span>
                  )}
                  <span>
                    {t('expiryDate')}: {expiryDisplay}
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
                {/* Stats */}
                <div className={LISTING_CARD_STYLES.statsContainer}>
                  <StatsDisplay
                    stats={{
                      views: viewCount,
                      contacts: contactCount,
                      customers: customerCount,
                    }}
                    animated
                    compact
                  />
                </div>
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
