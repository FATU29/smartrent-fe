import React from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { useVipTiers } from '@/hooks/useVipTiers'
import { useAuthContext } from '@/contexts/auth'
import { useMyMembership } from '@/hooks/useMembership'
import { useQuery } from '@tanstack/react-query'
import { UserService } from '@/api/services/user.service'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/atoms/card'
import { Separator } from '@/components/atoms/separator'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { OrderSummaryRow } from '@/components/molecules/orderSummary/orderSummaryRow'
import {
  Calendar,
  Package,
  CreditCard,
  Home,
  Bed,
  Bath,
  Ruler,
  MapPin,
  Sparkles,
  Award,
  User as UserIcon,
  Mail,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  getDirectionTranslationKey,
  getFurnishingTranslationKey,
  getProductTypeTranslationKey,
} from '@/utils/property'
import { AMENITIES_CONFIG } from '@/constants/amenities'
import { toYouTubeEmbed } from '@/utils/video/url'

interface OrderSummarySectionProps {
  className?: string
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.orderSummary')
  const tCommon = useTranslations('common')
  const tCreatePost = useTranslations('createPost')
  const tNormal = useTranslations()

  const { propertyInfo, media, composedLegacyAddress, composedNewAddress } =
    useCreatePost()

  const { data: vipTiers = [] } = useVipTiers()
  const { user } = useAuthContext()
  const { data: myMembership } = useMyMembership(user?.userId)

  const { data: profileResponse, isLoading: isCheckingProfile } = useQuery({
    queryKey: ['create-post-order-summary-profile', user?.userId],
    queryFn: () => UserService.getProfile(),
    enabled: !!user?.userId,
    retry: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const profile = profileResponse?.data

  const mediaArray = Array.isArray(media) ? media : []

  const video = mediaArray.find((m) => m.mediaType === 'VIDEO')
  const videoUrl = video?.url
  const isYouTubeVideo = video?.sourceType === 'YOUTUBE'
  const embedUrl = videoUrl && isYouTubeVideo ? toYouTubeEmbed(videoUrl) : null

  const coverImage = mediaArray.find(
    (m) => m.mediaType === 'IMAGE' && m.isPrimary,
  )?.url

  const selectedTier = vipTiers.find((t) => t.tierCode === propertyInfo.vipType)

  const usingMembershipQuota = !!propertyInfo.useMembershipQuota
  const usingPromotion = Array.isArray(propertyInfo?.benefitIds)
    ? propertyInfo?.benefitIds?.length > 0
    : false

  const selectedBenefit = React.useMemo(() => {
    if (!myMembership?.benefits || !propertyInfo.benefitIds?.length) {
      return null
    }
    const benefitId = propertyInfo.benefitIds[0]
    return (
      myMembership.benefits.find((b) => b.userBenefitId === benefitId) || null
    )
  }, [myMembership, propertyInfo.benefitIds])

  const packageName =
    usingMembershipQuota || usingPromotion
      ? selectedBenefit?.benefitNameDisplay || t('freePosting')
      : selectedTier?.tierName || t('notSelected')

  const totalPrice = (() => {
    const duration = propertyInfo.durationDays
    if (usingMembershipQuota || usingPromotion) return 0
    if (!selectedTier || !duration) return 0
    switch (duration) {
      case 10:
        return selectedTier.price10Days
      case 15:
        return selectedTier.price15Days
      case 30:
        return selectedTier.price30Days
      default:
        return (selectedTier.pricePerDay || 0) * duration
    }
  })()

  const formatDate = (date?: string | Date) => {
    if (!date) return t('notSelected')
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('vi-VN')
  }

  const getEndDate = () => {
    const duration = propertyInfo.durationDays
    const postDate = propertyInfo.postDate
    if (!postDate || !duration) return 'N/A'
    const startDate = new Date(postDate)
    const endDate = new Date(
      startDate.getTime() + duration * 24 * 60 * 60 * 1000,
    )
    return endDate.toLocaleDateString('vi-VN')
  }

  const contactFullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()

  const contactEmail =
    profile?.email?.trim() || user?.email?.trim() || tCommon('notAvailable')

  const contactPhone =
    profile?.contactPhoneNumber?.trim() ||
    profile?.phoneNumber?.trim() ||
    user?.contactPhoneNumber?.trim() ||
    user?.phoneNumber?.trim() ||
    tCommon('notAvailable')

  const latitude = propertyInfo?.address?.latitude
  const longitude = propertyInfo?.address?.longitude
  const hasValidCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude !== 0 &&
    longitude !== 0
  const embeddedMapUrl = hasValidCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : ''

  return (
    <Card className={cn('border-0 shadow-none', className)}>
      <CardHeader className='px-0'>
        <CardTitle className='text-2xl sm:text-3xl md:text-4xl'>
          {t('title')}
        </CardTitle>
        <CardDescription className='text-sm sm:text-base'>
          {t('description')}
        </CardDescription>
      </CardHeader>

      <CardContent className='px-0'>
        {/* Stacked Layout: Main Content on top, Payment Summary below */}
        <div className='flex flex-col gap-6'>
          {/* Top - Main Content */}
          <div className='space-y-6'>
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {tCommon('contactInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  <div className='h-full min-h-[92px] rounded-lg border bg-muted/30 p-3'>
                    <div className='flex flex-col items-center justify-center gap-2 h-full text-center'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 flex-shrink-0'>
                        <UserIcon className='w-4 h-4 text-primary' />
                      </div>
                      <div className='min-w-0'>
                        <Typography variant='muted' className='text-xs'>
                          {tCommon('fullName')}
                        </Typography>
                        <Typography className='mt-1 text-sm font-semibold leading-5 break-words'>
                          {contactFullName || tCommon('notAvailable')}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className='h-full min-h-[92px] rounded-lg border bg-muted/30 p-3'>
                    <div className='flex flex-col items-center justify-center gap-2 h-full text-center'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 flex-shrink-0'>
                        <Mail className='w-4 h-4 text-primary' />
                      </div>
                      <div className='min-w-0'>
                        <Typography variant='muted' className='text-xs'>
                          {tCommon('email')}
                        </Typography>
                        <Typography className='mt-1 text-sm font-semibold leading-5 break-all'>
                          {contactEmail}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className='h-full min-h-[92px] rounded-lg border bg-muted/30 p-3'>
                    <div className='flex flex-col items-center justify-center gap-2 h-full text-center'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 flex-shrink-0'>
                        <Phone className='w-4 h-4 text-primary' />
                      </div>
                      <div className='min-w-0'>
                        <Typography variant='muted' className='text-xs'>
                          {tCommon('phoneNumber')}
                        </Typography>
                        <Typography className='mt-1 text-sm font-semibold leading-5 break-words'>
                          {isCheckingProfile &&
                          contactPhone === tCommon('notAvailable')
                            ? tCommon('checking')
                            : contactPhone}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package & Payment Summary */}
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
              {/* Package Details */}
              <Card className='h-fit'>
                <CardHeader className='pb-4'>
                  <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                    <Package className='w-5 h-5 text-primary' />
                    <CardTitle className='text-lg'>
                      {tCreatePost('sections.orderSummary.packageDetails')}
                    </CardTitle>
                  </Card>
                </CardHeader>

                <CardContent className='space-y-3'>
                  <OrderSummaryRow
                    label={tCreatePost(
                      'sections.packageConfig.selectedPackage',
                    )}
                    value={
                      <Badge variant='default' className='font-medium'>
                        {packageName}
                      </Badge>
                    }
                    variant='highlight'
                  />
                  {(usingMembershipQuota || usingPromotion) && (
                    <>
                      <Separator />
                      <OrderSummaryRow
                        label={tCreatePost(
                          'sections.packageConfig.usingMembershipQuota',
                        )}
                        value={
                          <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                            <Award className='w-4 h-4 text-primary' />
                            <Typography className='text-sm text-primary font-medium'>
                              {tCreatePost(
                                'sections.packageConfig.freePosting',
                              )}
                            </Typography>
                          </Card>
                        }
                      />
                    </>
                  )}
                  <Separator />
                  <OrderSummaryRow
                    label={tCreatePost('sections.packageConfig.duration')}
                    value={`${propertyInfo.durationDays || 0} ${tCreatePost('sections.packageConfig.days')}`}
                  />
                  <Separator />
                  <OrderSummaryRow
                    label={tCreatePost('sections.packageConfig.startDate')}
                    value={
                      <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                        <Calendar className='w-4 h-4 text-muted-foreground' />
                        <Typography className='text-sm'>
                          {formatDate(propertyInfo.postDate)}
                        </Typography>
                      </Card>
                    }
                  />
                  <Separator />
                  <OrderSummaryRow
                    label={tCreatePost('sections.packageConfig.endDate')}
                    value={
                      <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                        <Calendar className='w-4 h-4 text-muted-foreground' />
                        <Typography className='text-sm'>
                          {getEndDate()}
                        </Typography>
                      </Card>
                    }
                  />
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card className='h-fit'>
                <CardHeader className='pb-4'>
                  <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                    <CreditCard className='w-5 h-5 text-primary' />
                    <CardTitle className='text-lg'>
                      {tCreatePost('sections.packageConfig.priceBreakdown')}
                    </CardTitle>
                  </Card>
                </CardHeader>

                <CardContent className='space-y-3'>
                  <OrderSummaryRow
                    label={tCreatePost('sections.packageConfig.packagePrice')}
                    value={`${totalPrice.toLocaleString('vi-VN')} đ`}
                  />
                  <Separator className='my-4' />
                  <OrderSummaryRow
                    label={tCreatePost('sections.packageConfig.totalAmount')}
                    value={
                      <Card className='text-right border-0 shadow-none p-0'>
                        <Typography className='text-2xl font-bold text-primary'>
                          {totalPrice.toLocaleString('vi-VN')} đ
                        </Typography>
                      </Card>
                    }
                    variant='total'
                  />
                </CardContent>
              </Card>
            </div>

            {/* Property Preview with Media */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {tCreatePost('sections.propertyInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Media Section - Video Priority or Cover Image - Responsive */}
                {(videoUrl || coverImage) && (
                  <div className='relative w-full rounded-lg overflow-hidden bg-muted'>
                    {videoUrl ? (
                      // Video takes priority
                      <div className='relative w-full aspect-video bg-muted rounded-lg overflow-hidden'>
                        {isYouTubeVideo && embedUrl ? (
                          // YouTube video - use iframe
                          <iframe
                            src={embedUrl}
                            title='YouTube video player'
                            className='w-full h-full'
                            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                            allowFullScreen
                          />
                        ) : (
                          // Uploaded video - use video tag
                          <video
                            src={videoUrl}
                            controls
                            className='w-full h-full object-contain'
                            preload='metadata'
                          />
                        )}
                      </div>
                    ) : (
                      // Fallback to cover image
                      <div className='relative w-full aspect-video'>
                        <Image
                          src={coverImage as string}
                          alt={tCreatePost(
                            'sections.propertyInfo.propertyCover',
                          )}
                          fill
                          className='object-cover'
                          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px'
                          priority
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Property Details */}
                <div className='space-y-4'>
                  <Typography
                    variant='h3'
                    className='font-bold text-xl sm:text-2xl break-words leading-tight'
                  >
                    {propertyInfo.title ||
                      tCreatePost('sections.propertyInfo.noTitle')}
                  </Typography>

                  {propertyInfo.description && (
                    <div className='rounded-lg border bg-muted/20 p-3'>
                      <Typography
                        variant='muted'
                        className='text-sm leading-6 line-clamp-4 break-words'
                      >
                        {propertyInfo.description}
                      </Typography>
                    </div>
                  )}

                  <Separator />

                  {/* Key Information Grid */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {propertyInfo.price && (
                      <div className='rounded-lg border bg-background/70 p-3'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10'>
                            <CreditCard className='w-4 h-4 text-primary flex-shrink-0' />
                          </div>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.price')}
                          </Typography>
                        </div>
                        <div className='min-w-0'>
                          <Typography className='mt-2 font-semibold text-sm break-words'>
                            {propertyInfo.price.toLocaleString('vi-VN')} đ
                            {propertyInfo.priceUnit &&
                              `/${propertyInfo.priceUnit}`}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {propertyInfo.area && (
                      <div className='rounded-lg border bg-background/70 p-3'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10'>
                            <Ruler className='w-4 h-4 text-primary flex-shrink-0' />
                          </div>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.area')}
                          </Typography>
                        </div>
                        <div className='min-w-0'>
                          <Typography className='mt-2 font-semibold text-sm'>
                            {propertyInfo.area} m²
                          </Typography>
                        </div>
                      </div>
                    )}

                    {propertyInfo.bedrooms && (
                      <div className='rounded-lg border bg-background/70 p-3'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10'>
                            <Bed className='w-4 h-4 text-primary flex-shrink-0' />
                          </div>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.bedrooms')}
                          </Typography>
                        </div>
                        <div className='min-w-0'>
                          <Typography className='mt-2 font-semibold text-sm'>
                            {propertyInfo.bedrooms}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {propertyInfo.bathrooms && (
                      <div className='rounded-lg border bg-background/70 p-3'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10'>
                            <Bath className='w-4 h-4 text-primary flex-shrink-0' />
                          </div>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.bathrooms')}
                          </Typography>
                        </div>
                        <div className='min-w-0'>
                          <Typography className='mt-2 font-semibold text-sm'>
                            {propertyInfo.bathrooms}
                          </Typography>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {(composedNewAddress || composedLegacyAddress) && (
                    <>
                      <Separator />
                      <div className='rounded-lg border bg-muted/20 p-3 space-y-3'>
                        <div className='flex items-start gap-2'>
                          <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 mt-0.5 flex-shrink-0'>
                            <MapPin className='w-4 h-4 text-primary' />
                          </div>
                          <div className='min-w-0 flex-1 space-y-1'>
                            {composedNewAddress && (
                              <Typography className='text-sm break-words mt-1'>
                                <span className='font-medium'>
                                  {tCreatePost(
                                    'sections.propertyInfo.address.structureType.newShort',
                                  )}
                                  :
                                </span>{' '}
                                {composedNewAddress}
                              </Typography>
                            )}
                            {composedLegacyAddress && (
                              <Typography className='text-xs text-muted-foreground break-words'>
                                <span className='font-medium'>
                                  {tCreatePost(
                                    'sections.propertyInfo.address.structureType.legacyShort',
                                  )}
                                  :
                                </span>{' '}
                                {composedLegacyAddress}
                              </Typography>
                            )}
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Typography
                            variant='muted'
                            className='text-xs flex items-center gap-1'
                          >
                            <MapPin className='w-3 h-3' />
                            {tCreatePost('sections.propertyInfo.mapPreview')}
                          </Typography>

                          {hasValidCoordinates ? (
                            <>
                              <div className='overflow-hidden rounded-lg border bg-background'>
                                <iframe
                                  src={embeddedMapUrl}
                                  title={tCreatePost(
                                    'sections.propertyInfo.mapPreview',
                                  )}
                                  className='w-full h-52'
                                  loading='lazy'
                                  referrerPolicy='no-referrer-when-downgrade'
                                />
                              </div>
                              <Typography
                                variant='muted'
                                className='text-xs break-words'
                              >
                                {tCreatePost(
                                  'sections.propertyInfo.coordinates',
                                )}
                                :&nbsp;
                                {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                              </Typography>
                            </>
                          ) : (
                            <div className='rounded-lg border border-dashed bg-background p-3'>
                              <Typography
                                variant='muted'
                                className='text-xs text-center'
                              >
                                {tCreatePost(
                                  'sections.propertyInfo.mapNotSelected',
                                )}
                              </Typography>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Property Type & Direction */}
                  <Separator />
                  <div className='flex flex-wrap gap-2'>
                    {propertyInfo.productType && (
                      <Badge variant='secondary' className='gap-1 px-2.5 py-1'>
                        <Home className='w-3 h-3' />
                        {tNormal(
                          getProductTypeTranslationKey(
                            propertyInfo.productType,
                          ),
                        )}
                      </Badge>
                    )}
                    {propertyInfo.direction && (
                      <Badge variant='outline' className='px-2.5 py-1'>
                        {tNormal(
                          getDirectionTranslationKey(propertyInfo.direction),
                        )}
                      </Badge>
                    )}
                    {propertyInfo.furnishing && (
                      <Badge variant='outline' className='px-2.5 py-1'>
                        {tNormal(
                          getFurnishingTranslationKey(propertyInfo.furnishing),
                        )}
                      </Badge>
                    )}
                  </div>

                  {/* Amenities */}
                  {propertyInfo.amenityIds &&
                    propertyInfo.amenityIds.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Typography
                            variant='muted'
                            className='text-xs mb-2 flex items-center gap-1'
                          >
                            <Sparkles className='w-3 h-3' />
                            {tCreatePost(
                              'sections.propertyInfo.amenities.title',
                            )}{' '}
                            ({propertyInfo.amenityIds.length})
                          </Typography>
                          <div className='flex flex-wrap gap-1'>
                            {propertyInfo.amenityIds
                              .slice(0, 6)
                              .map((id: number) => {
                                const amenity = AMENITIES_CONFIG.find(
                                  (a) => a.id === id,
                                )
                                const IconComponent = amenity?.icon
                                return (
                                  <Badge
                                    key={id}
                                    variant='secondary'
                                    className='text-xs flex items-center gap-1 px-2 py-1'
                                  >
                                    {IconComponent && (
                                      <IconComponent className='w-3 h-3' />
                                    )}
                                    {amenity
                                      ? tCreatePost(
                                          `sections.propertyInfo.amenities.${amenity.translationKey}`,
                                        )
                                      : `ID: ${id}`}
                                  </Badge>
                                )
                              })}
                            {propertyInfo.amenityIds.length > 6 && (
                              <Badge
                                variant='secondary'
                                className='text-xs px-2 py-1'
                              >
                                +{propertyInfo.amenityIds.length - 6}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export { OrderSummarySection }
export type { OrderSummarySectionProps }
