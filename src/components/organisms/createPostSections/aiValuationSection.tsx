import React, { useMemo, useEffect, useState, useRef } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Alert, AlertDescription } from '@/components/atoms/alert'
import {
  BarChart3,
  RefreshCw,
  Home,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { Input } from '@/components/atoms/input'
import { getAmenityByCode } from '@/constants/amenities'
import { getAiPropertyTypeOptions, getAmenityItems } from './index.helper'
import { useHousingPredictor } from '@/hooks/useAI'
import {
  buildHousingPredictorRequest,
  getAveragePrice,
  isTypeSupportedForAiValuation,
  resolveValuationAddress,
} from '@/utils/ai/housingPredictor'
import { formatByLocale } from '@/utils/currency/convert'
import type { HousingPredictorResponse } from '@/api/types/ai.type'
import { toast } from 'sonner'

interface AIValuationSectionProps {
  className?: string
}

const AIValuationSection: React.FC<AIValuationSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.aiValuation')
  const tPropertyInfo = useTranslations('createPost.sections.propertyInfo')
  const tPropertyDetails = useTranslations(
    'createPost.sections.propertyDetails',
  )
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')

  const {
    propertyInfo,
    fulltextAddress,
    composedLegacyAddress,
    composedNewAddress,
  } = useCreatePost()
  const [prediction, setPrediction] = useState<HousingPredictorResponse | null>(
    null,
  )

  const {
    mutate: predictPrice,
    isPending: isPredicting,
    error: predictionError,
  } = useHousingPredictor()

  const predictionRequest = useMemo(() => {
    const addressNames = resolveValuationAddress(
      {
        legacyAddressText: fulltextAddress?.legacyAddressText,
        newProvinceName: fulltextAddress?.newProvinceName,
        newWardName: fulltextAddress?.newWardName,
      },
      composedNewAddress,
    )
    if (!addressNames) return null

    return buildHousingPredictorRequest(propertyInfo, addressNames)
  }, [
    propertyInfo,
    fulltextAddress?.legacyAddressText,
    fulltextAddress?.newProvinceName,
    fulltextAddress?.newWardName,
    composedNewAddress,
  ])

  const requestKey = useMemo(() => {
    return predictionRequest ? JSON.stringify(predictionRequest) : null
  }, [predictionRequest])

  // Track mount with a ref and ensure auto-call happens only once after mount
  const mountedRef = useRef(false)
  const didAutoCallRef = useRef(false)

  // Mark as mounted
  useEffect(() => {
    mountedRef.current = true
  }, [])

  // Only auto-call once after mount when request is ready
  useEffect(() => {
    if (!mountedRef.current) return
    if (didAutoCallRef.current) return
    if (!predictionRequest || isPredicting || prediction) return

    didAutoCallRef.current = true
    predictPrice(predictionRequest, {
      onSuccess: (response) => {
        if (response.code === '999999' && response.data) {
          setPrediction(response.data)
        } else {
          toast.error('Dịch vụ định giá AI tạm thời không khả dụng')
        }
      },
      onError: () => {
        toast.error('Dịch vụ định giá AI tạm thời không khả dụng')
      },
    })
  }, [predictionRequest, requestKey, isPredicting, prediction, predictPrice])

  const handleReevaluate = () => {
    if (!predictionRequest) return
    setPrediction(null)
    didAutoCallRef.current = false
    predictPrice(predictionRequest, {
      onSuccess: (response) => {
        if (response.code === '999999' && response.data) {
          setPrediction(response.data)
        } else {
          toast.error('Dịch vụ định giá AI tạm thời không khả dụng')
        }
      },
      onError: () => {
        toast.error('Dịch vụ định giá AI tạm thời không khả dụng')
      },
    })
  }

  const formatPrice = (price: number) => {
    return formatByLocale(price, 'vi-VN')
  }

  const propertyTypeLabel = useMemo(() => {
    if (!propertyInfo.productType) return ''
    const options = getAiPropertyTypeOptions(t, tPropertyDetails)
    const option = options.find(
      (opt) => opt.value === propertyInfo.productType?.toLowerCase(),
    )
    return option?.label || propertyInfo.productType
  }, [propertyInfo.productType, t, tPropertyDetails])

  // Treat a range with no comparable listings behind it the same as an explicit
  // fallback: in both cases it is not backed by market data.
  const isFallbackEstimate =
    prediction?.source === 'rule_based_fallback' ||
    prediction?.listings_found === 0

  // Older backends omit these fields entirely; stay silent rather than claiming
  // evidence we did not receive.
  const hasEvidence =
    typeof prediction?.listings_found === 'number' &&
    prediction.listings_found > 0

  const confidenceLabel = useMemo(() => {
    switch (prediction?.confidence) {
      case 'high':
        return t('results.confidence.high') || 'Cao'
      case 'medium':
        return t('results.confidence.medium') || 'Trung bình'
      case 'low':
        return t('results.confidence.low') || 'Thấp'
      default:
        return ''
    }
  }, [prediction?.confidence, t])

  const confidenceDotClass =
    prediction?.confidence === 'high'
      ? 'bg-green-500'
      : prediction?.confidence === 'medium'
        ? 'bg-amber-500'
        : 'bg-muted-foreground'

  const canPredict = !!predictionRequest
  // AI valuation supports every listing property type. When prediction is
  // unavailable this still distinguishes "not supported for this type" (e.g. an
  // unrecognized/legacy value) from "required address/area/GPS data is missing".
  const typeSupportedForAi = isTypeSupportedForAiValuation(
    typeof propertyInfo.productType === 'string'
      ? propertyInfo.productType
      : (propertyInfo.productType as unknown as string),
  )

  return (
    <div className={className}>
      <div className='grid grid-cols-1 gap-8'>
        {/* Top Section - AI Valuation Results */}
        <Card className='border-0 shadow-none bg-transparent rounded-none py-0 sm:shadow-sm sm:bg-gradient-to-br sm:from-background sm:to-primary/5 sm:rounded-xl sm:py-6'>
          <CardHeader className='pb-3 px-0 sm:px-6'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-foreground'>
              <div className='p-2 bg-gradient-to-r from-primary to-primary/70 rounded-lg'>
                <BarChart3 className='w-6 h-6 text-primary-foreground' />
              </div>
              {t('results.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-5 px-0 sm:px-6'>
            {/* Loading State */}
            {isPredicting && !prediction && (
              <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <Loader2 className='w-12 h-12 text-blue-500 animate-spin' />
                <p className='text-sm text-muted-foreground'>
                  {t('results.loading') || 'Đang phân tích và dự đoán giá...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {predictionError && !prediction && (
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-semibold text-red-800 dark:text-red-300 mb-1'>
                      {t('results.error.title') || 'Không thể dự đoán giá'}
                    </h4>
                    <p className='text-sm text-red-700 dark:text-red-400'>
                      {t('results.error.message') ||
                        'Đã xảy ra lỗi khi dự đoán giá. Vui lòng thử lại sau.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Price Range */}
            {prediction && (
              <>
                <div className='mt-3 sm:mt-4 space-y-2 sm:space-y-3'>
                  <h3 className='text-sm sm:text-base font-semibold text-foreground'>
                    {t('results.suggestedPrice')}
                  </h3>
                  <div className='bg-gradient-to-r from-primary to-primary/70 rounded-2xl p-4 sm:p-6 text-primary-foreground shadow-lg mb-2 sm:mb-3'>
                    <div className='text-lg sm:text-xl font-bold leading-tight tracking-tight mb-2'>
                      {formatPrice(prediction.price_range.min)} -{' '}
                      {formatPrice(prediction.price_range.max)}
                    </div>
                    <div className='text-sm opacity-90'>
                      {prediction.location}
                    </div>
                  </div>

                  {/* Evidence behind the range. Without this a range derived
                      from real comparable listings looks identical to one the
                      hardcoded fallback table produced after the AI failed. */}
                  {isFallbackEstimate ? (
                    <Alert className='border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
                      <AlertCircle />
                      <AlertDescription className='text-amber-800 dark:text-amber-200'>
                        {t('results.fallbackNotice') ||
                          'Ước tính tham khảo dựa trên mức giá trung bình theo khu vực, chưa đối chiếu với tin đăng thực tế. Hãy tự khảo sát thêm trước khi quyết định giá.'}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    hasEvidence && (
                      <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                        <span className='flex items-center gap-1.5'>
                          <BarChart3 className='w-3.5 h-3.5' />
                          {t('results.basedOnListings', {
                            count: prediction.listings_found ?? 0,
                          }) ||
                            `Dựa trên ${prediction.listings_found} tin đăng tương tự`}
                        </span>
                        {confidenceLabel && (
                          <span className='flex items-center gap-1.5'>
                            <span
                              className={`w-2 h-2 rounded-full ${confidenceDotClass}`}
                            />
                            {t('results.confidenceLabel') || 'Độ tin cậy'}:{' '}
                            {confidenceLabel}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Price Details */}
                <div className='space-y-3'>
                  <div className='flex justify-between items-center p-3 bg-muted rounded-xl'>
                    <span className='text-sm text-muted-foreground'>
                      {t('results.minPrice') || 'Giá tối thiểu'}:
                    </span>
                    <span className='text-sm font-semibold text-blue-600 dark:text-blue-400'>
                      {formatPrice(prediction.price_range.min)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-muted rounded-xl'>
                    <span className='text-sm text-muted-foreground'>
                      {t('results.averagePrice') || 'Giá trung bình'}:
                    </span>
                    <span className='text-sm font-semibold text-green-600 dark:text-green-400'>
                      {formatPrice(
                        getAveragePrice(
                          prediction.price_range.min,
                          prediction.price_range.max,
                        ),
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-muted rounded-xl'>
                    <span className='text-sm text-muted-foreground'>
                      {t('results.maxPrice') || 'Giá tối đa'}:
                    </span>
                    <span className='text-sm font-semibold text-orange-600 dark:text-orange-400'>
                      {formatPrice(prediction.price_range.max)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Placeholder when no prediction */}
            {!prediction && !isPredicting && !predictionError && (
              <div className='text-center py-12'>
                <BarChart3 className='w-16 h-16 text-muted-foreground/50 mx-auto mb-4' />
                <p className='text-sm text-muted-foreground'>
                  {t('results.noPrediction') ||
                    'Nhấn \"Đánh giá lại\" để xem dự đoán giá từ AI'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Section - Property Information Input */}
        <Card className='border-0 shadow-none bg-transparent rounded-none py-0 sm:shadow-sm sm:bg-gradient-to-br sm:from-background sm:to-muted sm:rounded-xl sm:py-6'>
          {/* Warning callout above the section: these fields mirror the data
              entered earlier, so completeness/accuracy there drives the AI
              valuation quality. */}
          <div className='px-0 sm:px-6 pb-4'>
            <Alert className='border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
              <AlertCircle />
              <AlertDescription className='text-amber-800 dark:text-amber-200'>
                {t('propertyInfo.subtitle')}
              </AlertDescription>
            </Alert>
          </div>
          <CardHeader className='pb-4 px-0 sm:px-6'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-foreground'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                <Home className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
              {t('propertyInfo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6 px-0 sm:px-6'>
            {/* New Address (Read-only) */}
            {composedNewAddress && (
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-blue-500' />
                  {tPropertyInfo('displayAddress')} (
                  {tAddress('structureType.newShort') || 'Mới'})
                </label>
                <div className='relative group'>
                  <Input
                    type='text'
                    disabled
                    className='pl-12 h-12 px-4 pr-10 border-2 border-border rounded-xl bg-muted/50 text-foreground focus:ring-2 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                    placeholder={tPropertyInfo('displayAddressPlaceholder')}
                    value={composedNewAddress}
                  />
                </div>
              </div>
            )}

            {/* Legacy Address (Read-only) */}
            {composedLegacyAddress && (
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-orange-500' />
                  {tAddress('legacyAddress') ||
                    'Địa chỉ hiển thị trên tin đăng (phiên bản cũ)'}
                </label>
                <div className='relative group'>
                  <Input
                    type='text'
                    disabled
                    className='pl-12 h-12 px-4 pr-10 border-2 border-border rounded-xl bg-muted/50 text-foreground focus:ring-2 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                    placeholder={
                      tAddress('legacyAddressPlaceholder') ||
                      'Địa chỉ cũ sẽ hiển thị ở đây'
                    }
                    value={composedLegacyAddress}
                  />
                </div>
              </div>
            )}

            {/* Main Layout: One row for Type + Area (applies on mobile) */}
            <div className='grid grid-cols-2 gap-3 w-full'>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-foreground'>
                  {t('propertyInfo.type')}
                </label>
                <Input
                  type='text'
                  value={propertyTypeLabel}
                  disabled
                  placeholder={t('propertyInfo.type')}
                  className='h-12 px-4 pr-10 border-2 border-border rounded-xl bg-background text-foreground focus:ring-2 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-foreground'>
                  {t('propertyInfo.area')}
                </label>
                <div className='relative'>
                  <Input
                    type='text'
                    value={propertyInfo.area}
                    disabled
                    placeholder='0'
                    className='h-12 px-4 pr-12 border-2 border-border rounded-xl bg-background text-foreground focus:ring-2 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                  />
                  <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground'>
                    m²
                  </span>
                </div>
              </div>
            </div>

            {/* Second row for Bedrooms + Bathrooms (read-only) */}
            <div className='grid grid-cols-2 gap-3 w-full'>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-foreground'>
                  {t('propertyInfo.bedrooms')}
                </label>
                <Input
                  type='text'
                  value={propertyInfo.bedrooms}
                  disabled
                  placeholder='0'
                  className='h-12 px-4 pr-10 border-2 border-border rounded-xl bg-background text-foreground focus:ring-2 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-foreground'>
                  {t('propertyInfo.bathrooms')}
                </label>
                <Input
                  type='text'
                  value={propertyInfo.bathrooms}
                  disabled
                  placeholder='0'
                  className='h-12 px-4 pr-10 border-2 border-border rounded-xl bg-background text-foreground focus:ring-2 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                />
              </div>
            </div>

            {/* Amenities - Full width below grid */}
            <div className='space-y-4'>
              <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                {t('propertyInfo.amenities')}
              </label>
              <div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3'>
                  {getAmenityItems(tPropertyInfo).map((amenity) => {
                    const amenityConfig = getAmenityByCode(amenity.key)
                    const IconComponent = amenityConfig?.icon
                    const hasAmenity =
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (propertyInfo as any).amenities?.includes(amenity.id) ||
                      propertyInfo.amenityIds?.includes(amenity.id)

                    return (
                      <label
                        key={amenity.key}
                        className='flex items-center gap-3 min-w-0 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-muted border-border text-muted-foreground hover:bg-accent focus-within:border-primary focus-within:bg-primary/5 w-full'
                      >
                        <input
                          type='checkbox'
                          className='w-4 h-4 rounded border-2 border-input text-primary focus:ring-0 focus:outline-none focus-visible:outline-none flex-shrink-0 pointer-events-none'
                          checked={hasAmenity}
                          readOnly
                        />
                        {IconComponent && (
                          <IconComponent className='w-4 h-4 flex-shrink-0' />
                        )}
                        <span className='text-sm font-medium whitespace-normal break-words leading-snug min-w-0 flex-1'>
                          {amenity.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Re-evaluate Button */}
            <div className='flex justify-end'>
              <Button
                onClick={handleReevaluate}
                disabled={!canPredict || isPredicting}
                className='w-full sm:w-auto px-10 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                {isPredicting ? (
                  <>
                    <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                    {t('propertyInfo.predicting') || 'Đang dự đoán...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className='w-5 h-5 mr-2' />
                    {t('propertyInfo.reevaluate')}
                  </>
                )}
              </Button>
            </div>
            {!canPredict && (
              <p className='text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1'>
                <AlertCircle className='w-3 h-3' />
                {typeSupportedForAi
                  ? t('propertyInfo.incompleteData') ||
                    'Vui lòng điền đầy đủ thông tin địa chỉ, diện tích và tọa độ GPS'
                  : t('propertyInfo.unsupportedType') ||
                    'Định giá AI chỉ khả dụng cho căn hộ, nhà ở, phòng trọ và studio.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* End Top Section */}
      </div>
    </div>
  )
}

export { AIValuationSection }
export type { AIValuationSectionProps }
