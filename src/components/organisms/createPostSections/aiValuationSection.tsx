import React from 'react'
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
  TrendingUp,
  Save,
  Share2,
  RefreshCw,
  Home,
  MapPin,
  CheckCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { getAmenityByCode } from '@/constants/amenities'
import {
  getAiPropertyTypeOptions,
  getResultsComparisonItems,
  getAmenityItems,
} from './index.helper'

interface AIValuationSectionProps {
  className?: string
}

const AIValuationSection: React.FC<AIValuationSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.aiValuation')
  const tAddress = useTranslations('createPost.sections.propertyInfo.address')
  const tPropertyInfo = useTranslations('createPost.sections.propertyInfo')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()

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
                      | 'apartment'
                      | 'house'
                      | 'villa'
                      | 'studio',
                  })
                }
                options={getAiPropertyTypeOptions(t)}
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
            <Button className='w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105'>
              <RefreshCw className='w-5 h-5 mr-2' />
              {t('propertyInfo.reevaluate')}
            </Button>
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
            {/* Suggested Price Range */}
            <div className='mt-3 sm:mt-4 space-y-2 sm:space-y-3'>
              <h3 className='text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300'>
                {t('results.suggestedPrice')}
              </h3>
              <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg mb-2 sm:mb-3'>
                <div className='text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight mb-1 sm:mb-2'>
                  {t('results.priceRange')}
                </div>
                <div className='flex items-center gap-2 sm:gap-2.5'>
                  <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse'></div>
                  <span className='text-xs sm:text-sm opacity-90'>
                    {t('results.reliability')}: 85%
                  </span>
                </div>
              </div>
            </div>

            {/* Price Comparison Chart */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {t('results.comparisonChart')}
              </h3>
              <div className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-inner'>
                <div className='h-40 flex items-end justify-between gap-2'>
                  {getResultsComparisonItems(t).map((item, index) => (
                    <div
                      key={`comparison-item-${index}`}
                      className='flex flex-col items-center flex-1 group'
                    >
                      <div
                        className={`w-full ${item.color} rounded-t-lg shadow-lg transition-all duration-300 group-hover:scale-105`}
                        style={{ height: `${(item.value / 3.2) * 100}%` }}
                      ></div>
                      <span className='text-xs text-gray-600 dark:text-gray-400 mt-2 text-center font-medium'>
                        {item.district}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Information */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {t('results.marketInfo')}
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('results.averagePrice')}:
                  </span>
                  <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    {t('results.averagePriceValue')}
                  </span>
                </div>
                <div className='flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('results.similarProperties')}:
                  </span>
                  <span className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    {t('results.similarPropertiesValue')}
                  </span>
                </div>
                <div className='flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('results.trend')}:
                  </span>
                  <div className='flex items-center gap-2'>
                    <TrendingUp className='w-4 h-4 text-green-500' />
                    <span className='text-sm font-semibold text-green-600 dark:text-green-400'>
                      {t('results.trendValue')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Tip */}
            <div className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4'>
              <h4 className='text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2'>
                <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                {t('results.optimizationTip.title')}
              </h4>
              <p className='text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed'>
                {t('results.optimizationTip.description')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full'>
              <Button
                variant='outline'
                className='w-full sm:w-auto flex-1 h-12 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-semibold transition-all duration-200'
              >
                <Save className='w-4 h-4 mr-2' />
                {t('results.actions.save')}
              </Button>
              <Button
                variant='outline'
                className='w-full sm:w-auto flex-1 h-12 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-semibold transition-all duration-200'
              >
                <Share2 className='w-4 h-4 mr-2' />
                {t('results.actions.share')}
              </Button>
            </div>

            {/* Feedback */}
            <div className='text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {t('results.feedback')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { AIValuationSection }
export type { AIValuationSectionProps }
