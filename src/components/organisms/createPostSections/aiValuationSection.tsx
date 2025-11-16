import React, { useMemo, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import SelectDropdown from '@/components/atoms/select-dropdown'
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
import { getAmenityByCode } from '@/constants/amenities'
import { getAiPropertyTypeOptions, getAmenityItems } from './index.helper'
import { useHousingPredictor } from '@/hooks/useAI'
import {
  extractAddressNames,
  buildHousingPredictorRequest,
  getAveragePrice,
} from '@/utils/ai/housingPredictor'
import {
  useLegacyProvinces,
  useLegacyDistricts,
  useLegacyWards,
  useNewProvinces,
  useNewWards,
} from '@/hooks/useAddress'
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
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')
  const tPropertyInfo = useTranslations('createPost.sections.propertyInfo')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()
  const [prediction, setPrediction] = useState<HousingPredictorResponse | null>(
    null,
  )

  // Address data hooks

  const selectedLegacyProvinceId = useMemo(() => {
    const id = parseInt(propertyInfo?.province || '0')
    return id > 0 ? id : undefined
  }, [propertyInfo?.province])

  const selectedLegacyDistrictId = useMemo(() => {
    const id = parseInt(propertyInfo?.district || '0')
    return id > 0 ? id : undefined
  }, [propertyInfo?.district])

  const { data: legacyProvinces = [] } = useLegacyProvinces()
  const { data: legacyDistricts = [] } = useLegacyDistricts(
    selectedLegacyProvinceId,
  )
  const { data: legacyWards = [] } = useLegacyWards(selectedLegacyDistrictId)
  const { data: newProvinces = [] } = useNewProvinces()
  const { data: newWards = [] } = useNewWards(propertyInfo?.newProvinceCode)

  // Find selected address entities
  const selectedLegacyProvince = useMemo(() => {
    return legacyProvinces.find(
      (p) => p.provinceId === selectedLegacyProvinceId,
    )
  }, [legacyProvinces, selectedLegacyProvinceId])

  const selectedLegacyDistrict = useMemo(() => {
    return legacyDistricts.find(
      (d) => d.districtId === selectedLegacyDistrictId,
    )
  }, [legacyDistricts, selectedLegacyDistrictId])

  const selectedLegacyWard = useMemo(() => {
    const wardId = parseInt(propertyInfo?.ward || '0')
    return legacyWards.find((w) => w.wardId === wardId)
  }, [legacyWards, propertyInfo?.ward])

  const selectedNewProvince = useMemo(() => {
    return newProvinces.find((p) => p.code === propertyInfo?.newProvinceCode)
  }, [newProvinces, propertyInfo?.newProvinceCode])

  const selectedNewWard = useMemo(() => {
    return newWards.find((w) => w.code === propertyInfo?.newWardCode)
  }, [newWards, propertyInfo?.newWardCode])

  // Extract address names
  const addressNames = useMemo(() => {
    return extractAddressNames(
      propertyInfo,
      selectedLegacyProvince,
      selectedLegacyDistrict,
      selectedLegacyWard,
      selectedNewProvince,
      selectedNewWard,
    )
  }, [
    propertyInfo,
    selectedLegacyProvince,
    selectedLegacyDistrict,
    selectedLegacyWard,
    selectedNewProvince,
    selectedNewWard,
  ])

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

  // Track if we've attempted prediction for current request
  const predictionRequestRef = React.useRef<string | null>(null)

  // Auto-predict when predictionRequest becomes available or changes
  useEffect(() => {
    if (!predictionRequest) {
      // Reset prediction when request becomes invalid
      if (prediction) {
        setPrediction(null)
      }
      predictionRequestRef.current = null
      return
    }

    // Create a unique key for this request to avoid duplicate calls
    const requestKey = JSON.stringify(predictionRequest)

    // Only predict if:
    // 1. We have a valid request
    // 2. We haven't predicted for this exact request yet
    // 3. We're not currently predicting
    if (requestKey !== predictionRequestRef.current && !isPredicting) {
      predictionRequestRef.current = requestKey
      predictPrice(predictionRequest, {
        onSuccess: (response) => {
          if (response.code === '999999' && response.data) {
            setPrediction(response.data)
          } else {
            // Reset ref on failure so we can retry
            predictionRequestRef.current = null
          }
        },
        onError: () => {
          // Error handled by predictionError
          predictionRequestRef.current = null
        },
      })
    }
  }, [predictionRequest, isPredicting, predictPrice])

  // Handle re-evaluate button
  const handleReevaluate = () => {
    if (!predictionRequest) return
    // Reset ref to allow re-prediction
    predictionRequestRef.current = null
    setPrediction(null)
    predictPrice(predictionRequest, {
      onSuccess: (response) => {
        if (response.code === '999999' && response.data) {
          setPrediction(response.data)
          // Update ref to prevent duplicate calls
          predictionRequestRef.current = JSON.stringify(predictionRequest)
        }
      },
    })
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return formatByLocale(price, 'vi-VN')
  }

  // Check if we can predict
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
            {/* Address Structure Switch */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {tAddress('structureType.label')}
              </label>
              <div className='flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg'>
                <button
                  type='button'
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    propertyInfo?.addressStructureType === 'legacy'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  onClick={() =>
                    updatePropertyInfo({ addressStructureType: 'legacy' })
                  }
                >
                  {tAddress('structureType.legacyShort')}
                </button>
                <button
                  type='button'
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    propertyInfo?.addressStructureType === 'new'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  onClick={() =>
                    updatePropertyInfo({ addressStructureType: 'new' })
                  }
                >
                  {tAddress('structureType.newShort')}
                </button>
              </div>
            </div>

            {/* Display Address (Read-only) */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-blue-500' />
                {tPropertyInfo('displayAddress')}
              </label>
              <div className='relative group'>
                <MapPin className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  readOnly
                  className='w-full h-12 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 cursor-not-allowed transition-all duration-200'
                  placeholder={tPropertyInfo('displayAddressPlaceholder')}
                  value={propertyInfo?.propertyAddress || ''}
                />
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {t('propertyInfo.addressReadOnlyHint')}
              </p>
            </div>

            {/* Main Layout: One row for Type + Area (applies on mobile) */}
            <div className='grid grid-cols-2 gap-3 w-full'>
              <SelectDropdown
                label={t('propertyInfo.type')}
                value={propertyInfo.propertyType}
                onValueChange={(value) =>
                  updatePropertyInfo({
                    propertyType: value as
                      | 'room'
                      | 'apartment'
                      | 'house'
                      | 'office'
                      | 'store',
                  })
                }
                options={getAiPropertyTypeOptions(t, tCommon)}
                className='space-y-2'
                disabled
              />
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {t('propertyInfo.area')}
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value={propertyInfo.area}
                    readOnly
                    placeholder='0'
                    className='w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base'
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
                <input
                  type='text'
                  value={propertyInfo.bedrooms}
                  readOnly
                  placeholder='0'
                  className='w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {t('propertyInfo.bathrooms')}
                </label>
                <input
                  type='text'
                  value={propertyInfo.bathrooms}
                  readOnly
                  placeholder='0'
                  className='w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base'
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

                    return (
                      <label
                        key={amenity.key}
                        className={`grid grid-cols-[auto,auto,1fr] items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors duration-200 w-full min-w-0 min-h-12 ${
                          propertyInfo.amenities?.includes(amenity.key)
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
                          checked={
                            propertyInfo.amenities?.includes(amenity.key) ||
                            false
                          }
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
