import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { RankDisplay } from '@/components/atoms/rank-display'
import { VerificationBadge } from '@/components/atoms/verification-badge'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { ListingCardActions } from '@/components/molecules/listingCardActions'
import { Card, CardContent } from '@/components/atoms/card'
import { cn } from '@/lib/utils'
import { toISO, formatISO } from '@/utils/date/safe'
import { formatByLocale } from '@/utils/currency/convert'
import { getPriceUnitTranslationKey } from '@/utils/property'
import { useLanguage } from '@/hooks/useLanguage'
import { ListingOwnerDetail } from '@/api/types'
import {
  MapPin,
  Calendar,
  Maximize2,
  Bed,
  Bath,
  Eye,
  Phone,
  Users,
} from 'lucide-react'
import { DEFAULT_IMAGE } from '@/constants/common'
import { AMENITIES_CONFIG } from '@/constants/amenities'
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
  const { language } = useLanguage()
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
    listingViews,
    interested,
    customers,
    statistics,
    media,
    address,
    price,
    priceUnit,
    amenities,
    roomCapacity,
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
          <div className='relative w-full aspect-square sm:w-56 shrink-0 bg-gradient-to-br from-muted/50 to-muted'>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={cn(
                'object-cover transition-all duration-300',
                hasImage && 'group-hover:scale-105',
              )}
              unoptimized={!hasImage}
            />

            <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20' />

            {/* VIP Type Badge */}
            {vipType && vipType !== 'NORMAL' && (
              <div className='absolute top-3 left-3'>
                <Badge
                  variant='default'
                  className='backdrop-blur-md bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg border-yellow-600'
                >
                  {t(`vipTypes.${vipType}`)}
                </Badge>
              </div>
            )}

            {/* Status Badge - Show expired or verified */}
            <div className='absolute top-3 right-3'>
              {isExpired ? (
                <Badge className='backdrop-blur-md bg-red-500 text-white border-red-600 shadow-md font-medium hover:bg-red-600'>
                  {t('status.expired')}
                </Badge>
              ) : verified ? (
                <Badge className='backdrop-blur-md bg-green-500 text-white border-green-600 shadow-md font-medium hover:bg-green-600'>
                  {t('status.active')}
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Content Section - Enhanced alignment */}
          <div className='flex-1 min-w-0 flex flex-col p-5 sm:p-6 text-base'>
            {/* Title & Badges */}
            <div className='space-y-2 mb-4'>
              <Typography
                variant='h4'
                className='line-clamp-2 group-hover:text-primary transition-colors leading-tight text-lg sm:text-xl'
              >
                {title}
              </Typography>

              <div className='flex items-center gap-2 flex-wrap'>
                {productType && (
                  <Badge variant='secondary' className='font-medium'>
                    {productType}
                  </Badge>
                )}
                {verified && (
                  <VerificationBadge verified={verified} type='verified' />
                )}
                {showRank && (
                  <RankDisplay rank={{ page: 1, position: rankOfVipType }} />
                )}
              </div>
            </div>

            {/* Addresses - Full text display with better styling */}
            <div className='space-y-2 mb-4'>
              {newAddress && (
                <div className='flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/10'>
                  <MapPin className='w-5 h-5 mt-0.5 shrink-0 text-primary' />
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
                <div className='flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900'>
                  <MapPin className='w-5 h-5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400' />
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
              <div className='mb-4'>
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
                        +{amenities.length - 5} {t('more')}
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
              <div className='mb-4'>
                <div className='flex items-baseline gap-2'>
                  <Typography
                    variant='h3'
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

            {/* Property Specs - Column layout on mobile, grid on desktop */}
            <div className='flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {property.area && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 transition-all hover:bg-blue-100 dark:hover:bg-blue-950/50'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900'>
                    <Maximize2 className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('area')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold truncate text-blue-700 dark:text-blue-400 text-sm sm:text-base'
                    >
                      {property.area} m²
                    </Typography>
                  </div>
                </div>
              )}

              {roomCapacity !== undefined && roomCapacity > 0 && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 transition-all hover:bg-orange-100 dark:hover:bg-orange-950/50'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900'>
                    <Users className='w-5 h-5 text-orange-600 dark:text-orange-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('roomCapacity')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold truncate text-orange-700 dark:text-orange-400 text-sm sm:text-base'
                    >
                      {roomCapacity} {t('people')}
                    </Typography>
                  </div>
                </div>
              )}

              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 transition-all hover:bg-purple-100 dark:hover:bg-purple-950/50'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900'>
                    <Bed className='w-5 h-5 text-purple-600 dark:text-purple-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('bedrooms')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold truncate text-purple-700 dark:text-purple-400 text-sm sm:text-base'
                    >
                      {property.bedrooms}
                    </Typography>
                  </div>
                </div>
              )}

              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900 transition-all hover:bg-cyan-100 dark:hover:bg-cyan-950/50'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900'>
                    <Bath className='w-5 h-5 text-cyan-600 dark:text-cyan-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('bathrooms')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold truncate text-cyan-700 dark:text-cyan-400 text-sm sm:text-base'
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

              {/* Statistics */}
              <div className='flex items-center gap-4 p-3 rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 border border-muted'>
                <div className='flex items-center gap-1.5'>
                  <Eye className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  <div className='flex flex-col'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground leading-none'
                    >
                      {t('views')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold leading-tight text-sm sm:text-base'
                    >
                      {viewCount.toLocaleString()}
                    </Typography>
                  </div>
                </div>

                <div className='flex items-center gap-1.5'>
                  <Phone className='w-4 h-4 text-green-600 dark:text-green-400' />
                  <div className='flex flex-col'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground leading-none'
                    >
                      {t('contacts')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold leading-tight text-sm sm:text-base'
                    >
                      {contactCount.toLocaleString()}
                    </Typography>
                  </div>
                </div>

                <div className='flex items-center gap-1.5'>
                  <Users className='w-4 h-4 text-purple-600 dark:text-purple-400' />
                  <div className='flex flex-col'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground leading-none'
                    >
                      {t('customers')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold leading-tight text-sm sm:text-base'
                    >
                      {customerCount.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {isExpired && (
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
