import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { RankDisplay } from '@/components/atoms/rank-display'
import { VerificationBadge } from '@/components/atoms/verification-badge'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { ListingCardActions } from '@/components/molecules/listingCardActions'
import { Card, CardContent } from '@/components/atoms/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
import { cn } from '@/lib/utils'
import { toISO, formatISO } from '@/utils/date/safe'
import { formatByLocale } from '@/utils/currency/convert'
import {
  getPriceUnitTranslationKey,
  getProductTypeTranslationKey,
} from '@/utils/property'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'
import { ListingOwnerDetail } from '@/api/types'
import { ModerationStatus, POST_STATUS } from '@/api/types/property.type'
import {
  ModerationStatusBadge,
  ModerationBanner,
} from '@/components/molecules/moderation'
import {
  MapPin,
  Calendar,
  Maximize2,
  Bed,
  Bath,
  ExternalLink,
} from 'lucide-react'
import { DEFAULT_IMAGE } from '@/constants/common'
import { AMENITIES_CONFIG } from '@/constants/amenities'
import { buildApartmentDetailRoute } from '@/constants/route'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'

export interface ListingCardProps {
  property: ListingOwnerDetail
  onEdit?: () => void
  onPromote?: () => void
  onRepost?: () => void
  onRenew?: () => void
  onCopyListing?: () => void
  onTakeDown?: () => void
  onDelete?: () => void
  className?: string
}

export const ListingCard: React.FC<ListingCardProps> = ({
  property,
  onEdit,
  onPromote,
  onRepost,
  onRenew,
  onCopyListing,
  onTakeDown,
  onDelete,
  className,
}) => {
  const t = useTranslations('seller.listingManagement.card')
  const tNot = useTranslations()
  const { language } = useLanguage()
  const { user } = useAuth()
  // Blocked users cannot re-list — hide repost/renew CTAs (backend also blocks).
  const postingBlocked = Boolean(user?.postingBlocked)
  const [showAllAmenities, setShowAllAmenities] = React.useState(false)

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
    media,
    address,
    price,
    priceUnit,
    amenities,
  } = property

  // Moderation fields
  const moderationStatus = property.moderationStatus
  const permanentlyRemoved = property.permanentlyRemoved
  // permanentlyRemoved is a legacy fallback for rows predating the REMOVED status.
  const isPermanentlyRemoved =
    moderationStatus === ModerationStatus.REMOVED || !!permanentlyRemoved
  // Rejected and removed are terminal — no edit/resubmit. SUSPENDED (temporarily
  // hidden under report) and REVISION_REQUIRED are not "rejected".
  const isRejected = moderationStatus === ModerationStatus.REJECTED
  // The backend blocks generic edits on hidden/rejected/removed listings
  // (only REVISION_REQUIRED stays editable), so hide the edit CTA for those.
  const isEditBlocked =
    isRejected ||
    isPermanentlyRemoved ||
    moderationStatus === ModerationStatus.SUSPENDED

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
  const showRank = rankOfVipType > 0
  // A listing is publicly live under both DISPLAYING and EXPIRING_SOON — public
  // visibility only gates on moderationStatus=APPROVED + not expired, independent
  // of the "expiring within 7 days" distinction the owner view surfaces as a
  // separate badge. Keep the detail link (and push eligibility) in sync with that.
  const isPubliclyVisible =
    property.listingStatus === POST_STATUS.DISPLAYING ||
    property.listingStatus === POST_STATUS.EXPIRING_SOON
  // Pushing only applies to DISPLAYING/EXPIRING_SOON listings — hide it for
  // expired/taken-down so the seller doesn't see two near-identical "đẩy tin"
  // buttons. For expired listings the only call-to-action is "đăng lại" (repost).
  const showPromoteButton = !isExpired
  const showRepostButton = isExpired && !postingBlocked
  // Renewal is the +30-day quota top-up — restricted to listings the backend
  // has flagged EXPIRING_SOON + APPROVED. A fully-displaying listing with a
  // healthy expiry doesn't need (and shouldn't see) a renew CTA; once it
  // tips into EXPIRED the only path back is "đăng lại" (repost).
  const showRenewButton =
    !isExpired &&
    !postingBlocked &&
    vipType !== 'NORMAL' &&
    vipType !== undefined &&
    property.listingStatus === POST_STATUS.EXPIRING_SOON &&
    moderationStatus === ModerationStatus.APPROVED

  const postISO = toISO(postDate)
  const postDisplay = formatISO(postISO)
  const expiryISO = calculatedExpiryDate || toISO(expiryDate)
  const expiryDisplay =
    formatISO(expiryISO) || t('common.notAvailable', { default: 'N/A' })

  const hasImage = coverImageUrl !== undefined && coverImageUrl !== null
  const imageUrl = hasImage ? coverImageUrl : DEFAULT_IMAGE

  return (
    <Card
      className={cn(
        'group hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden',
        className,
      )}
    >
      <CardContent className='p-0'>
        <div className='flex flex-col sm:flex-row sm:items-start'>
          <div className='relative w-full aspect-[16/10] sm:aspect-square sm:w-56 shrink-0 bg-gradient-to-br from-muted/50 to-muted'>
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes='(max-width: 640px) 100vw, 224px'
              className={cn(
                'object-cover transition-all duration-300',
                hasImage && 'group-hover:scale-105',
              )}
              unoptimized={!hasImage}
            />

            <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20' />

            {/* Status Badge - Show moderation, expired or verified */}
            <div className='absolute top-3 right-3'>
              {moderationStatus &&
              moderationStatus !== ModerationStatus.APPROVED ? (
                <ModerationStatusBadge
                  status={moderationStatus}
                  permanentlyRemoved={permanentlyRemoved}
                />
              ) : isExpired ? (
                <Badge className='backdrop-blur-md bg-red-500 text-white border-red-600 shadow-md font-medium hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-700'>
                  {t('status.expired')}
                </Badge>
              ) : verified ? (
                <Badge className='backdrop-blur-md bg-green-500 text-white border-green-600 shadow-md font-medium hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-700'>
                  {t('status.active')}
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Content Section - Enhanced alignment */}
          <div className='flex-1 min-w-0 flex flex-col p-4 sm:p-6 text-base'>
            {/* Title & Badges */}
            <div className='space-y-2 mb-3 sm:mb-4'>
              <Typography
                variant='h4'
                className='line-clamp-2 group-hover:text-primary transition-colors leading-tight text-lg sm:text-xl'
              >
                {title}
              </Typography>

              <div className='flex items-center gap-2 flex-wrap'>
                {vipType && vipType !== 'NORMAL' && (
                  <Badge
                    variant='default'
                    className={cn(
                      'font-medium border',
                      vipType === 'DIAMOND' &&
                        'bg-violet-600 text-white border-violet-700 hover:bg-violet-600 dark:bg-violet-500 dark:border-violet-600',
                      vipType === 'GOLD' &&
                        'bg-amber-500 text-white border-amber-600 hover:bg-amber-500 dark:bg-amber-500 dark:border-amber-600',
                      vipType === 'SILVER' &&
                        'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600',
                    )}
                  >
                    {t(`vipTypes.${vipType}`)}
                  </Badge>
                )}
                {productType && (
                  <Badge variant='secondary' className='font-medium'>
                    {tNot(getProductTypeTranslationKey(productType))}
                  </Badge>
                )}
                {verified && (
                  <VerificationBadge verified={verified} type='verified' />
                )}
                {isPubliclyVisible && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={buildApartmentDetailRoute(listingId.toString())}
                          target='_blank'
                          rel='noopener noreferrer'
                          aria-label={t('viewListing')}
                          className='inline-flex items-center justify-center w-6 h-6 rounded-full border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors'
                        >
                          <ExternalLink className='w-3.5 h-3.5' />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{t('viewListing')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {showRank && (
                  <RankDisplay rank={{ page: 1, position: rankOfVipType }} />
                )}
              </div>
            </div>

            {/* Addresses - Full text display with better styling */}
            <div className='space-y-2 mb-3 sm:mb-4'>
              {newAddress && (
                <div className='flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/60'>
                  <MapPin className='w-4 h-4 mt-0.5 shrink-0 text-muted-foreground' />
                  <div className='flex-1 min-w-0'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {tNot('apartmentDetail.property.newAddress')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='text-foreground font-medium leading-relaxed'
                      title={newAddress}
                    >
                      {newAddress}
                    </Typography>
                  </div>
                </div>
              )}
              {legacyAddress && (
                <div className='flex items-start gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/60 border-dashed'>
                  <MapPin className='w-4 h-4 mt-0.5 shrink-0 text-muted-foreground' />
                  <div className='flex-1 min-w-0'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {tNot('apartmentDetail.property.legacyAddress')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='text-foreground font-medium leading-relaxed'
                      title={legacyAddress}
                    >
                      {legacyAddress}
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            {/* Amenities - Limit to 5 items with show more dialog */}
            {amenities && amenities.length > 0 && (
              <div className='mb-3 sm:mb-4'>
                <Typography
                  variant='small'
                  className='text-xs text-muted-foreground mb-2 font-medium'
                >
                  {t('amenities')}
                </Typography>
                <div className='flex flex-wrap gap-2'>
                  {amenities.slice(0, 5).map((amenity) => {
                    const amenityConfig = AMENITIES_CONFIG.find(
                      (config) => config.id === amenity.amenityId,
                    )
                    const IconComponent = amenityConfig?.icon

                    return (
                      <div
                        key={amenity.amenityId}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-muted-foreground/10'
                      >
                        {IconComponent && (
                          <IconComponent className='w-4 h-4 text-muted-foreground' />
                        )}
                        <Typography
                          variant='small'
                          className='text-xs text-foreground'
                        >
                          {amenity.name}
                        </Typography>
                      </div>
                    )
                  })}
                  {amenities.length > 5 && (
                    <button
                      onClick={() => setShowAllAmenities(true)}
                      className='flex items-center px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer'
                    >
                      <Typography
                        variant='small'
                        className='text-xs text-primary font-medium'
                      >
                        {t('more', { count: amenities.length - 5 })}
                      </Typography>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Amenities Dialog */}
            <Dialog open={showAllAmenities} onOpenChange={setShowAllAmenities}>
              <DialogContent className='max-w-2xl h-screen sm:h-auto sm:max-h-[80vh] w-full sm:max-w-2xl p-0 sm:p-6'>
                <DialogHeader className='px-6 pt-6 sm:p-0'>
                  <DialogTitle>{t('amenities')}</DialogTitle>
                </DialogHeader>
                <div className='overflow-y-auto h-[calc(100vh-100px)] sm:h-auto sm:max-h-[60vh] px-6 pb-6 sm:px-0 sm:pb-0 pr-2'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {amenities?.map((amenity) => {
                      const amenityConfig = AMENITIES_CONFIG.find(
                        (config) => config.id === amenity.amenityId,
                      )
                      const IconComponent = amenityConfig?.icon

                      return (
                        <div
                          key={amenity.amenityId}
                          className='flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10'
                        >
                          {IconComponent && (
                            <IconComponent className='w-5 h-5 text-muted-foreground shrink-0' />
                          )}
                          <Typography
                            variant='small'
                            className='text-sm text-foreground'
                          >
                            {amenity.name}
                          </Typography>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Price - Large display without card */}
            {price && (
              <div className='mb-3 sm:mb-4'>
                <div className='flex items-baseline gap-2'>
                  {/* Price is stat-value emphasis, not a heading — outside type ramp. */}
                  <Typography
                    variant='h3'
                    // eslint-disable-next-line design-system/no-inline-heading-sizes
                    className='font-bold text-primary text-xl sm:text-2xl'
                  >
                    {typeof price === 'number' && price > 0
                      ? formatByLocale(price, language)
                      : new Intl.NumberFormat('vi-VN').format(price || 0) +
                        '\u00A0₫'}
                  </Typography>
                  {priceUnit && (
                    <Typography
                      variant='large'
                      className='text-sm sm:text-base text-muted-foreground'
                    >
                      /{tNot(getPriceUnitTranslationKey(priceUnit))}
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {/* Property Specs — even 3-up row, compact on mobile */}
            <div className='grid grid-cols-3 gap-2 sm:gap-3 mb-4'>
              {property.area && (
                <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60'>
                  <Maximize2 className='w-4 h-4 shrink-0 text-muted-foreground' />
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='block text-micro text-muted-foreground'
                    >
                      {t('area')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='block font-semibold truncate text-foreground text-sm'
                    >
                      {property.area} m²
                    </Typography>
                  </div>
                </div>
              )}

              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60'>
                  <Bed className='w-4 h-4 shrink-0 text-muted-foreground' />
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='block text-micro text-muted-foreground'
                    >
                      {t('bedrooms')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='block font-semibold truncate text-foreground text-sm'
                    >
                      {property.bedrooms}
                    </Typography>
                  </div>
                </div>
              )}

              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60'>
                  <Bath className='w-4 h-4 shrink-0 text-muted-foreground' />
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='block text-micro text-muted-foreground'
                    >
                      {t('bathrooms')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='block font-semibold truncate text-foreground text-sm'
                    >
                      {property.bathrooms}
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            {/* Listing Info & Statistics - Better alignment */}
            <div className='space-y-3 mb-4'>
              {/* Listing Code and Dates */}
              <div className='flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 text-sm sm:text-base'>
                <div className='flex items-center gap-1.5'>
                  <Typography variant='small' className='text-muted-foreground'>
                    {t('listingCode')}:
                  </Typography>
                  <Typography variant='small' className='font-semibold'>
                    {listingId}
                  </Typography>
                </div>

                {postDisplay && (
                  <>
                    <span className='hidden sm:inline text-muted-foreground'>
                      •
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <Calendar className='w-3.5 h-3.5 text-muted-foreground' />
                      <Typography
                        variant='small'
                        className='text-muted-foreground'
                      >
                        {t('postDate')}:
                      </Typography>
                      <Typography variant='small' className='font-semibold'>
                        {postDisplay}
                      </Typography>
                    </div>
                  </>
                )}

                <span className='hidden sm:inline text-muted-foreground'>
                  •
                </span>
                <div className='flex items-center gap-1.5'>
                  <Calendar className='w-3.5 h-3.5 text-muted-foreground' />
                  <Typography variant='small' className='text-muted-foreground'>
                    {t('expiryDate')}:
                  </Typography>
                  <Typography variant='small' className='font-semibold'>
                    {expiryDisplay}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Moderation Banner */}
            {moderationStatus && (
              <ModerationBanner
                moderationStatus={moderationStatus}
                verificationNotes={property.verificationNotes}
                pendingOwnerAction={property.pendingOwnerAction}
                permanentlyRemoved={permanentlyRemoved}
                listingId={property.listingId}
                className='mb-4'
              />
            )}

            {/* Status Messages */}
            {isExpired && !moderationStatus && (
              <div className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900'>
                <Typography
                  variant='small'
                  className='text-red-700 dark:text-red-400 font-medium'
                >
                  {t('expiredMessage')}
                </Typography>
              </div>
            )}

            {/* Actions - Better alignment */}
            <div className='flex gap-2 mt-auto pt-4 border-t'>
              <ListingCardActions
                onEdit={onEdit}
                onPromote={onPromote}
                onRepost={onRepost}
                onRenew={onRenew}
                onCopyListing={onCopyListing}
                onTakeDown={onTakeDown}
                onDelete={onDelete}
                showPromoteButton={showPromoteButton}
                showRepostButton={showRepostButton}
                showRenewButton={showRenewButton}
                showEditButton={!postingBlocked && !isEditBlocked}
                onlyShowDelete={isPermanentlyRemoved}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
