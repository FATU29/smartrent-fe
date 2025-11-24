import React from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { useVipTiers } from '@/hooks/useVipTiers'
import { useAuthContext } from '@/contexts/auth'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import VideoPlayerFull from '@/components/molecules/videoPlayerFull'
import Image from 'next/image'
import {
  getDirectionTranslationKey,
  getFurnishingTranslationKey,
  getProductTypeTranslationKey,
} from '@/utils/property'
import { AMENITIES_CONFIG } from '@/constants/amenities'

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
  const { propertyInfo } = useCreatePost()
  const { data: vipTiers = [] } = useVipTiers()
  const { user } = useAuthContext()

  // Resolve selected VIP tier from vipType
  const selectedTier = vipTiers.find((t) => t.tierCode === propertyInfo.vipType)

  const packageName = selectedTier?.tierName || t('notSelected')

  // Compute total price based on durationDays using API-provided tier pricing
  const usingMembershipQuota = !!propertyInfo.useMembershipQuota
  const usingPromotion = Array.isArray(propertyInfo.benefitsMembership)
    ? propertyInfo.benefitsMembership.length > 0
    : false

  // Price calculation - no VAT or discount
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
        // Fallback: per-day price times days
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

  return (
    <Card className={cn('border-0 shadow-none', className)}>
      <CardHeader className='px-0'>
        <CardTitle className='text-2xl sm:text-3xl lg:text-4xl'>
          {t('title')}
        </CardTitle>
        <CardDescription className='text-sm sm:text-base'>
          {t('description')}
        </CardDescription>
      </CardHeader>

      <CardContent className='px-0'>
        {/* Flex Layout: Left Content + Right Payment Summary */}
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Left Side - Main Content */}
          <div className='flex-1 space-y-6  md:w-[calc(100%-444px)]'>
            {/* Property Preview with Media */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {tCreatePost('sections.propertyInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Media Section - Video or Cover Image - Fixed responsive */}
                {(propertyInfo.assets?.video ||
                  (propertyInfo.assets?.images &&
                    propertyInfo.assets.images.length > 0)) && (
                  <div
                    className='relative w-full max-w-full rounded-lg overflow-hidden bg-muted'
                    style={{
                      aspectRatio: '16/9',
                      maxHeight: '400px',
                    }}
                  >
                    {propertyInfo.assets?.video ? (
                      <VideoPlayerFull
                        src={propertyInfo.assets.video}
                        className='w-full h-full object-contain'
                      />
                    ) : propertyInfo.assets?.images?.[0] ? (
                      <Image
                        src={propertyInfo.assets.images[0]}
                        alt={tCreatePost('sections.propertyInfo.propertyCover')}
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      />
                    ) : null}
                  </div>
                )}

                {/* Property Details */}
                <div className='space-y-3'>
                  <Typography
                    variant='h3'
                    className='font-bold text-xl break-words'
                  >
                    {propertyInfo.title ||
                      tCreatePost('sections.propertyInfo.noTitle')}
                  </Typography>

                  {propertyInfo.description && (
                    <Typography
                      variant='muted'
                      className='text-sm line-clamp-3 break-words'
                    >
                      {propertyInfo.description}
                    </Typography>
                  )}

                  <Separator />

                  {/* Key Information Grid */}
                  <div className='grid grid-cols-2 gap-3'>
                    {propertyInfo.price && (
                      <div className='flex items-center gap-2'>
                        <CreditCard className='w-4 h-4 text-muted-foreground flex-shrink-0' />
                        <div className='min-w-0'>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.price')}
                          </Typography>
                          <Typography className='font-semibold text-sm truncate'>
                            {propertyInfo.price.toLocaleString('vi-VN')} đ
                            {propertyInfo.priceUnit &&
                              `/${propertyInfo.priceUnit}`}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {propertyInfo.area && (
                      <div className='flex items-center gap-2'>
                        <Ruler className='w-4 h-4 text-muted-foreground flex-shrink-0' />
                        <div className='min-w-0'>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.area')}
                          </Typography>
                          <Typography className='font-semibold text-sm'>
                            {propertyInfo.area} m²
                          </Typography>
                        </div>
                      </div>
                    )}

                    {propertyInfo.bedrooms && (
                      <div className='flex items-center gap-2'>
                        <Bed className='w-4 h-4 text-muted-foreground flex-shrink-0' />
                        <div className='min-w-0'>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.bedrooms')}
                          </Typography>
                          <Typography className='font-semibold text-sm'>
                            {propertyInfo.bedrooms}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {propertyInfo.bathrooms && (
                      <div className='flex items-center gap-2'>
                        <Bath className='w-4 h-4 text-muted-foreground flex-shrink-0' />
                        <div className='min-w-0'>
                          <Typography variant='muted' className='text-xs'>
                            {tCreatePost('sections.propertyInfo.bathrooms')}
                          </Typography>
                          <Typography className='font-semibold text-sm'>
                            {propertyInfo.bathrooms}
                          </Typography>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {((propertyInfo as unknown as { fullAddressNew?: string })
                    .fullAddressNew ||
                    propertyInfo.address?.legacy) && (
                    <>
                      <Separator />
                      <div className='flex items-start gap-2'>
                        <MapPin className='w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                        <div className='min-w-0 flex-1 space-y-1'>
                          {(
                            propertyInfo as unknown as {
                              fullAddressNew?: string
                            }
                          ).fullAddressNew && (
                            <Typography className='text-sm break-words'>
                              <span className='font-medium'>
                                {tCreatePost(
                                  'sections.propertyInfo.address.structureType.newShort',
                                )}
                                :
                              </span>
                              {
                                (
                                  propertyInfo as unknown as {
                                    fullAddressNew?: string
                                  }
                                ).fullAddressNew
                              }
                            </Typography>
                          )}
                          {propertyInfo.address?.legacy && (
                            <Typography className='text-xs text-muted-foreground break-words'>
                              <span className='font-medium'>
                                {tCreatePost(
                                  'sections.propertyInfo.address.structureType.legacyShort',
                                )}
                                :
                              </span>
                              {String(propertyInfo.address.legacy)}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Property Type & Direction */}
                  <Separator />
                  <div className='flex flex-wrap gap-2'>
                    {propertyInfo.productType && (
                      <Badge variant='secondary' className='gap-1'>
                        <Home className='w-3 h-3' />
                        {tNormal(
                          getProductTypeTranslationKey(
                            propertyInfo.productType,
                          ),
                        )}
                      </Badge>
                    )}
                    {propertyInfo.direction && (
                      <Badge variant='outline'>
                        {tNormal(
                          getDirectionTranslationKey(propertyInfo.direction),
                        )}
                      </Badge>
                    )}
                    {propertyInfo.furnishing && (
                      <Badge variant='outline'>
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
                            {propertyInfo.amenityIds.slice(0, 6).map((id) => {
                              const amenity = AMENITIES_CONFIG.find(
                                (a) => a.id === id,
                              )
                              const IconComponent = amenity?.icon
                              return (
                                <Badge
                                  key={id}
                                  variant='secondary'
                                  className='text-xs flex items-center gap-1'
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
                              <Badge variant='secondary' className='text-xs'>
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

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {tCommon('contactInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <OrderSummaryRow
                  label={tCommon('fullName')}
                  value={
                    user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : tCommon('notAvailable')
                  }
                />
                <Separator />
                <OrderSummaryRow
                  label={tCommon('email')}
                  value={user?.email || tCommon('notAvailable')}
                />
                <Separator />
                <OrderSummaryRow
                  label={tCommon('phoneNumber')}
                  value={user?.phoneNumber || tCommon('notAvailable')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Package & Payment Summary (Sticky) */}
          <Card className='lg:w-[380px] xl:w-[420px] h-fit lg:sticky lg:top-[100px] space-y-0'>
            {/* Package Details */}
            <CardHeader className='pb-4'>
              <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                <Package className='w-5 h-5 text-primary' />
                <CardTitle className='text-lg'>
                  {tCreatePost('sections.orderSummary.packageDetails')}
                </CardTitle>
              </Card>
            </CardHeader>

            <CardContent className='space-y-3 pb-6'>
              <OrderSummaryRow
                label={tCreatePost('sections.packageConfig.selectedPackage')}
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
                          {tCreatePost('sections.packageConfig.freePosting')}
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
                    <Typography className='text-sm'>{getEndDate()}</Typography>
                  </Card>
                }
              />
            </CardContent>

            <Separator className='my-0' />

            {/* Price Breakdown */}
            <CardHeader className='pt-6 pb-4'>
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
      </CardContent>
    </Card>
  )
}
export { OrderSummarySection }
export type { OrderSummarySectionProps }
