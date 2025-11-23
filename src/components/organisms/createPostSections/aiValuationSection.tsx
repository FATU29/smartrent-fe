import React, { useMemo, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
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
} from '@/utils/ai/housingPredictor'
import { useNewProvinces, useNewWards } from '@/hooks/useAddress'
import { formatByLocale } from '@/utils/currency/convert'
import type { HousingPredictorResponse } from '@/api/types/ai.type'

interface AIValuationSectionProps {
  className?: string
}

const AIValuationSection: React.FC<AIValuationSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.aiValuation')
  const tCommon = useTranslations('common')
  const tPropertyInfo = useTranslations('createPost.sections.propertyInfo')
  const { propertyInfo } = useCreatePost()
  const [prediction, setPrediction] = useState<HousingPredictorResponse | null>(
    null,
  )

  const { data: newProvinces = [] } = useNewProvinces()
  const { data: newWards = [] } = useNewWards(
    propertyInfo?.address?.new?.provinceId
      ? String(propertyInfo.address.new.provinceId)
      : undefined,
  )

  // Find selected address entities
  const selectedNewProvince = useMemo(() => {
    const provinceId = propertyInfo?.address?.new?.provinceId
    if (!provinceId) return undefined
    return newProvinces.find((p) => p.code === String(provinceId))
  }, [newProvinces, propertyInfo?.address?.new?.provinceId])

  const selectedNewWard = useMemo(() => {
    const wardId = propertyInfo?.address?.new?.wardId
    if (!wardId) return undefined
    return newWards.find((w) => w.code === String(wardId))
  }, [newWards, propertyInfo?.address?.new?.wardId])

  // Extract address names
  const addressNames = useMemo(() => {
    if (!selectedNewProvince || !selectedNewWard) return null

    return {
      city: selectedNewProvince.name,
      ward: selectedNewWard.name,
      district: '',
      street: propertyInfo,
    }
  }, [selectedNewProvince, selectedNewWard])

  // Housing predictor hook
  const {
    mutate: predictPrice,
    isPending: isPredicting,
    error: predictionError,
  } = useHousingPredictor()

  // Build request
  const predictionRequest = useMemo(() => {
    if (!addressNames) return null
    return buildHousingPredictorRequest(propertyInfo, addressNames)
  }, [propertyInfo, addressNames])

  // Auto-predict when predictionRequest becomes available or changes
  useEffect(() => {
    if (!predictionRequest || isPredicting) {
      return
    }

    predictPrice(predictionRequest, {
      onSuccess: (response) => {
        if (response.code === '999999' && response.data) {
          setPrediction(response.data)
        }
      },
    })
  }, [predictionRequest, isPredicting, predictPrice])

  // Handle re-evaluate button
  const handleReevaluate = () => {
    if (!predictionRequest) return
    setPrediction(null)
    predictPrice(predictionRequest, {
      onSuccess: (response) => {
        if (response.code === '999999' && response.data) {
          setPrediction(response.data)
        }
      },
    })
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return formatByLocale(price, 'vi-VN')
  }

  // Get property type label for display
  const propertyTypeLabel = useMemo(() => {
    if (!propertyInfo.propertyType) return ''
    const options = getAiPropertyTypeOptions(t, tCommon)
    const option = options.find(
      (opt) => opt.value === propertyInfo.propertyType?.toLowerCase(),
    )
    return option?.label || propertyInfo.propertyType
  }, [propertyInfo.propertyType, t, tCommon])

  const canPredict = !!predictionRequest

  return (
    <div className={className}>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left Section - Property Information Input */}
        <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                <Home className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
              {t('propertyInfo.title')}
            </CardTitle>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
              {t('propertyInfo.subtitle')}
            </p>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Display Address (Read-only) */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-blue-500' />
                {tPropertyInfo('displayAddress')}
              </label>
              <div className='relative group'>
                <MapPin className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10' />
                <Input
                  type='text'
                  readOnly
                  className='pl-12 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                  placeholder={tPropertyInfo('displayAddressPlaceholder')}
                  value={
                    (
                      propertyInfo as unknown as {
                        displayAddress?: string
                        propertyAddress?: string
                      }
                    ).displayAddress ||
                    (propertyInfo as unknown as { propertyAddress?: string })
                      .propertyAddress ||
                    ''
                  }
                />
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {t('propertyInfo.addressReadOnlyHint')}
              </p>
            </div>

            {/* Main Layout: One row for Type + Area (applies on mobile) */}
            <div className='grid grid-cols-2 gap-3 w-full'>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {t('propertyInfo.type')}
                </label>
                <Input
                  type='text'
                  value={propertyTypeLabel}
                  readOnly
                  placeholder={t('propertyInfo.type')}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {t('propertyInfo.area')}
                </label>
                <div className='relative'>
                  <Input
                    type='text'
                    value={propertyInfo.area}
                    readOnly
                    placeholder='0'
                    className='pr-12'
                  />
                  <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400'>
                    m²
                  </span>
                </div>
              </div>
            </div>

            {/* Second row for Bedrooms + Bathrooms (read-only) */}
            <div className='grid grid-cols-2 gap-3 w-full'>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {t('propertyInfo.bedrooms')}
                </label>
                <Input
                  type='text'
                  value={propertyInfo.bedrooms}
                  readOnly
                  placeholder='0'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {t('propertyInfo.bathrooms')}
                </label>
                <Input
                  type='text'
                  value={propertyInfo.bathrooms}
                  readOnly
                  placeholder='0'
                />
              </div>
            </div>

            {/* Amenities - Full width below grid */}
            <div className='space-y-4'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                {t('propertyInfo.amenities')}
              </label>
              <div className='max-h-[400px] overflow-y-auto overflow-x-hidden pr-2'>
                <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3'>
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
                        className={`grid grid-cols-[auto,auto,1fr] items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors duration-200 w-full min-w-0 min-h-12 ${
                          hasAmenity
                            ? amenity.color
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent className='w-4 h-4 shrink-0' />
                        )}
                        <input
                          type='checkbox'
                          className='w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 shrink-0'
                          checked={hasAmenity}
                          disabled
                        />
                        <span className='text-sm font-medium whitespace-normal break-words leading-snug min-w-0'>
                          {amenity.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Re-evaluate Button */}
            <Button
              onClick={handleReevaluate}
              disabled={!canPredict || isPredicting}
              className='w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
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
            {!canPredict && (
              <p className='text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1'>
                <AlertCircle className='w-3 h-3' />
                {t('propertyInfo.incompleteData') ||
                  'Vui lòng điền đầy đủ thông tin địa chỉ, diện tích và tọa độ GPS'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right Section - AI Valuation Results */}
        <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/20'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
              <div className='p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg'>
                <BarChart3 className='w-6 h-6 text-white' />
              </div>
              {t('results.title')}
            </CardTitle>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
              {t('results.subtitle')}
            </p>
          </CardHeader>
          <CardContent className='space-y-5'>
            {/* Loading State */}
            {isPredicting && !prediction && (
              <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <Loader2 className='w-12 h-12 text-blue-500 animate-spin' />
                <p className='text-sm text-gray-600 dark:text-gray-400'>
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
                  <h3 className='text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300'>
                    {t('results.suggestedPrice')}
                  </h3>
                  <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg mb-2 sm:mb-3'>
                    <div className='text-lg sm:text-xl font-bold leading-tight tracking-tight mb-2'>
                      {formatPrice(prediction.price_range.min)} -{' '}
                      {formatPrice(prediction.price_range.max)}
                    </div>
                    <div className='text-sm opacity-90 mb-3'>
                      {prediction.location}
                    </div>
                    <div className='flex items-center gap-2 sm:gap-2.5'>
                      <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse'></div>
                      <span className='text-xs sm:text-sm opacity-90'>
                        {t('results.reliability') || 'Độ tin cậy'}: 85%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Details */}
                <div className='space-y-3'>
                  <div className='flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      {t('results.minPrice') || 'Giá tối thiểu'}:
                    </span>
                    <span className='text-sm font-semibold text-blue-600 dark:text-blue-400'>
                      {formatPrice(prediction.price_range.min)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
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
                  <div className='flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
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
                <BarChart3 className='w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {t('results.noPrediction') ||
                    'Nhấn "Đánh giá lại" để xem dự đoán giá từ AI'}
                </p>
              </div>
            )}

            {/* Optimization Tip */}
            {prediction && (
              <div className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4'>
                <h4 className='text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2'>
                  <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                  {t('results.optimizationTip.title') || 'Lưu ý về dự đoán giá'}
                </h4>
                <p className='text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed'>
                  {t('results.optimizationTip.description') ||
                    'Giá dự đoán dựa trên AI/ML models và có thể khác với giá thực tế. Đây chỉ là tham khảo để bạn có cơ sở định giá ban đầu.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { AIValuationSection }
export type { AIValuationSectionProps }
