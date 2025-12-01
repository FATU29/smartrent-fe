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
  MapPin,
  Zap,
  FileText,
  Send,
  Home,
  DollarSign,
  Zap as ZapIcon,
  Navigation,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFormContext, Controller } from 'react-hook-form'
import { useCreatePost } from '@/contexts/createPost'
import { useDebounce } from '@/hooks/useDebounce'
import type {
  CreateListingRequest,
  Direction,
  FURNISHING,
  PriceType,
  PriceUnit,
  PropertyType,
} from '@/api/types/property.type'
import { useLocationContext } from '@/contexts/location'
import {
  getInteriorConditionOptions,
  getUtilityPriceOptions,
  getInternetOptions,
  getDirectionOptions,
  getAmenityItems,
  getPriceUnitOptions,
  getPropertyTypeOptions,
  getCategoryOptions,
  getToneOptions,
} from './index.helper'
import { getAmenityByCode, AMENITIES_CONFIG } from '@/constants/amenities'
import { useCategories } from '@/hooks/useCategories'
import { AddressInput } from '@/components/molecules/createPostAddress'
import GoogleMapPicker from '@/components/molecules/googleMapPicker'
import NumberField from '@/components/atoms/number-field'
import classNames from 'classnames'
import { useGenerateListingDescription } from '@/hooks/useAI'
import type { ListingDescriptionRequest } from '@/api/types/ai.type'

interface PropertyInfoSectionProps {
  className?: string
}

const PropertyInfoSection: React.FC<PropertyInfoSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.propertyInfo')
  const tCommon = useTranslations('common')
  const tDetails = useTranslations('createPost.sections.propertyDetails')
  const tUtilities = useTranslations('createPost.sections.utilitiesStructure')
  const tValuation = useTranslations('createPost.sections.aiValuation')
  const tAI = useTranslations('createPost.sections.aiContent')
  const tPlaceholders = useTranslations(
    'createPost.sections.utilitiesStructure.placeholders',
  )
  const tValidation = useTranslations('createPost.validation')

  const getValidationKey = (message: string | undefined): string => {
    if (!message) return ''
    return message.replace(/^createPost\.validation\./, '')
  }

  const { control, setValue } = useFormContext<Partial<CreateListingRequest>>()

  const {
    propertyInfo,
    updatePropertyInfo,
    composedNewAddress,
    composedLegacyAddress,
  } = useCreatePost()

  const {
    coordinates,
    requestLocation,
    isLoading: locationLoading,
  } = useLocationContext()

  const { mutate: generateAI, isPending: aiLoading } =
    useGenerateListingDescription()

  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.categories ?? []

  const [aiTone, setAiTone] = React.useState<'friendly' | 'professionally'>(
    'friendly',
  )

  const {
    title,
    description,
    address,
    categoryId,
    productType,
    furnishing,
    amenityIds,
  } = propertyInfo

  // Local state for title and description with debouncing
  const [titleInput, setTitleInput] = React.useState<string>(title || '')
  const [descriptionInput, setDescriptionInput] = React.useState<string>(
    description || '',
  )

  // Debounce title and description to optimize performance
  const debouncedTitle = useDebounce(titleInput, 500)
  const debouncedDescription = useDebounce(descriptionInput, 500)

  const { latitude, longitude } = address || {}

  // Update property info when debounced title changes
  React.useEffect(() => {
    if (debouncedTitle !== title) {
      updatePropertyInfo({ title: debouncedTitle })
    }
  }, [debouncedTitle])

  // Update property info when debounced description changes
  React.useEffect(() => {
    if (debouncedDescription !== description) {
      updatePropertyInfo({ description: debouncedDescription })
    }
  }, [debouncedDescription])

  // Sync local state with external updates (e.g., from AI generation)
  React.useEffect(() => {
    if (title !== titleInput) {
      setTitleInput(title || '')
    }
  }, [title])

  React.useEffect(() => {
    if (description !== descriptionInput) {
      setDescriptionInput(description || '')
    }
  }, [description])

  React.useEffect(() => {
    if (propertyInfo?.categoryId) {
      setValue('categoryId', propertyInfo?.categoryId, {
        shouldValidate: true,
      })
    }
    if (propertyInfo?.productType) {
      setValue('productType', propertyInfo?.productType, {
        shouldValidate: true,
      })
    }
    if (propertyInfo?.address) {
      setValue('address', propertyInfo?.address, { shouldValidate: true })
    }
    if (propertyInfo.area) {
      setValue('area', propertyInfo?.area, { shouldValidate: true })
    }
    if (propertyInfo?.price) {
      setValue('price', propertyInfo?.price, { shouldValidate: true })
    }
    if (propertyInfo?.priceUnit) {
      setValue('priceUnit', propertyInfo?.priceUnit, { shouldValidate: true })
    }
    if (propertyInfo?.title) {
      setValue('title', propertyInfo?.title, { shouldValidate: true })
    }
    if (propertyInfo.description) {
      setValue('description', propertyInfo?.description, {
        shouldValidate: true,
      })
    }
    if (propertyInfo?.waterPrice) {
      setValue('waterPrice', propertyInfo?.waterPrice, { shouldValidate: true })
    }
    if (propertyInfo?.electricityPrice) {
      setValue('electricityPrice', propertyInfo?.electricityPrice, {
        shouldValidate: true,
      })
    }
    if (propertyInfo?.internetPrice) {
      setValue('internetPrice', propertyInfo?.internetPrice, {
        shouldValidate: true,
      })
    }
    if (propertyInfo?.serviceFee) {
      setValue('serviceFee', propertyInfo?.serviceFee, {
        shouldValidate: true,
      })
    }
    if (propertyInfo?.furnishing) {
      setValue('furnishing', propertyInfo?.furnishing, { shouldValidate: true })
    }
    if (propertyInfo?.bedrooms) {
      setValue('bedrooms', propertyInfo?.bedrooms, { shouldValidate: true })
    }
    if (propertyInfo.bathrooms) {
      setValue('bathrooms', propertyInfo?.bathrooms, { shouldValidate: true })
    }
    if (propertyInfo?.direction) {
      setValue('direction', propertyInfo?.direction, { shouldValidate: true })
    }
  }, [propertyInfo, setValue])

  const handleUseMyLocation = async () => {
    await requestLocation()
    if (coordinates) {
      updatePropertyInfo({
        address: {
          ...propertyInfo.address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      })
    }
  }

  const handleGenerateAI = () => {
    const categoryItem = categoryId
      ? categories.find((c) => c.categoryId === categoryId)
      : null
    const categoryName = categoryItem?.icon || ''

    const amenityCodes: string[] = []
    if (amenityIds && amenityIds.length > 0) {
      amenityIds.forEach((id) => {
        const amenity = AMENITIES_CONFIG.find((a) => a.id === id)
        if (amenity) {
          amenityCodes.push(amenity.code)
        }
      })
    }

    if (
      !categoryName ||
      !productType ||
      !furnishing ||
      !propertyInfo?.direction ||
      !propertyInfo?.waterPrice ||
      !propertyInfo?.electricityPrice ||
      !propertyInfo?.internetPrice ||
      !propertyInfo?.serviceFee ||
      !propertyInfo?.price ||
      propertyInfo.price <= 0 ||
      !propertyInfo?.priceUnit ||
      !propertyInfo?.area ||
      !propertyInfo?.bedrooms ||
      !propertyInfo?.bathrooms
    ) {
      return
    }

    const req: ListingDescriptionRequest = {
      category: categoryName,
      propertyType: productType,
      price: propertyInfo.price,
      priceUnit: propertyInfo.priceUnit,
      addressText: {
        newAddress: composedNewAddress || '',
        legacy: composedLegacyAddress,
      },
      area: propertyInfo.area,
      bedrooms: propertyInfo.bedrooms,
      bathrooms: propertyInfo.bathrooms,
      direction: propertyInfo.direction,
      furnishing: furnishing,
      amenities: amenityCodes,
      waterPrice: propertyInfo.waterPrice,
      electricityPrice: propertyInfo.electricityPrice,
      internetPrice: propertyInfo.internetPrice,
      serviceFee: propertyInfo.serviceFee,
      tone: aiTone,
      titleMaxWords: 100,
      titleMinWords: 30,
      descriptionMaxWords: 1000,
      descriptionMinWords: 70,
    }

    generateAI(req, {
      onSuccess: (resp) => {
        const generatedTitle = resp.data?.title || title || ''
        const generatedDescription = resp.data?.description || description || ''

        updatePropertyInfo({
          title: generatedTitle,
          description: generatedDescription,
        })
      },
    })
  }

  return (
    <div className={classNames(className)}>
      {/* Layout Wrapper */}
      <div className='space-y-10'>
        {/* Main Property Information Card */}
        <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                <FileText className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
              {t('listingInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Category Type */}
            <Controller
              name='categoryId'
              control={control}
              render={({ fieldState: { error } }) => (
                <div className='space-y-2'>
                  <SelectDropdown
                    label={
                      <>
                        {t('categoryType')}
                        <span className='text-destructive ml-1'>*</span>
                      </>
                    }
                    value={categoryId?.toString()}
                    onValueChange={(value) => {
                      updatePropertyInfo({
                        categoryId: Number(value),
                      })
                    }}
                    placeholder={tPlaceholders('selectCategoryType')}
                    options={getCategoryOptions(tCommon, categories)}
                    error={
                      error?.message
                        ? tValidation(getValidationKey(error.message))
                        : undefined
                    }
                  />
                </div>
              )}
            />
            {/* Property Type */}
            <Controller
              name='productType'
              control={control}
              render={({ fieldState: { error } }) => (
                <div className='space-y-2'>
                  <SelectDropdown
                    label={
                      <>
                        {tDetails('propertyType')}
                        <span className='text-destructive ml-1'>*</span>
                      </>
                    }
                    value={productType?.toLowerCase()}
                    onValueChange={(value) => {
                      const upperValue = value.toUpperCase() as PropertyType
                      updatePropertyInfo({
                        productType: upperValue,
                      })
                    }}
                    placeholder={tPlaceholders('selectPropertyType')}
                    options={getPropertyTypeOptions(tDetails)}
                    error={
                      error?.message
                        ? tValidation(getValidationKey(error.message))
                        : undefined
                    }
                  />
                </div>
              )}
            />

            {/* Property Address */}
            <Controller
              name='address'
              control={control}
              render={({ fieldState: { error } }) => (
                <div className='space-y-3'>
                  <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                    <MapPin className='w-4 h-4 text-blue-500' />
                    {t('propertyAddress')}
                    <span className='text-destructive ml-1'>*</span>
                  </label>
                  <AddressInput
                    className='w-full'
                    error={
                      error?.message
                        ? tValidation(getValidationKey(error.message))
                        : undefined
                    }
                  />
                </div>
              )}
            />

            {/* Map Preview */}
            <div className='space-y-4'>
              {/* Make header responsive: stack on mobile, inline on sm+ */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-normal break-words leading-snug'>
                  {t('mapPreview')}
                </h3>
                <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full sm:w-auto'
                    onClick={handleUseMyLocation}
                    disabled={locationLoading}
                  >
                    <Send className='w-4 h-4 mr-1' />
                    {locationLoading ? t('loading') : t('useMyLocation')}
                  </Button>
                </div>
              </div>

              {/* Google Map Picker */}
              <GoogleMapPicker
                latitude={latitude || 10.762622}
                longitude={longitude || 106.660172}
                onLocationSelect={(lat, lng) => {
                  updatePropertyInfo({
                    address: { latitude: lat, longitude: lng },
                  })
                }}
              />

              <div className='text-xs text-gray-500 dark:text-gray-400 space-y-1'>
                <p>{t('dragMarker')}</p>
                <p>{t('searchAddresses')}</p>
                <p className='flex items-center gap-1'>
                  <MapPin className='w-3 h-3' />
                  {t('interactiveMap')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details Card */}
        <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
              <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
                <Home className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
              {tDetails('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Area and Price Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Controller
                name='area'
                control={control}
                render={({ fieldState: { error } }) => (
                  <div className='space-y-2'>
                    <NumberField
                      label={tDetails('area')}
                      value={propertyInfo?.area ?? 0}
                      onChange={(v) => {
                        updatePropertyInfo({ area: v })
                      }}
                      placeholder={tPlaceholders('enterArea')}
                      suffix='m²'
                      min={0}
                      required
                      error={
                        error?.message
                          ? tValidation(getValidationKey(error.message))
                          : undefined
                      }
                    />
                  </div>
                )}
              />
              <Controller
                name='price'
                control={control}
                render={({ fieldState: { error } }) => (
                  <div className='space-y-2'>
                    <NumberField
                      label={tDetails('price')}
                      value={propertyInfo?.price ?? 0}
                      onChange={(v) => {
                        updatePropertyInfo({ price: v })
                      }}
                      placeholder={tPlaceholders('enterPrice')}
                      suffix='VND'
                      min={0}
                      required
                      error={
                        error?.message
                          ? tValidation(getValidationKey(error.message))
                          : undefined
                      }
                    />
                  </div>
                )}
              />
              <Controller
                name='priceUnit'
                control={control}
                render={({ fieldState: { error } }) => (
                  <div className='space-y-2'>
                    <SelectDropdown
                      label={tDetails('priceUnit')}
                      value={propertyInfo?.priceUnit}
                      onValueChange={(v) => {
                        updatePropertyInfo({ priceUnit: v as PriceUnit })
                      }}
                      placeholder={tPlaceholders('selectPriceUnit')}
                      options={getPriceUnitOptions(tCommon)}
                      error={
                        error?.message
                          ? tValidation(getValidationKey(error.message))
                          : undefined
                      }
                    />
                  </div>
                )}
              />
            </div>

            {/* Interior Condition */}
            <Controller
              name='furnishing'
              control={control}
              render={({ fieldState: { error } }) => (
                <div className='space-y-2'>
                  <SelectDropdown
                    label={
                      <>
                        {tDetails('interiorCondition')}
                        <span className='text-destructive ml-1'>*</span>
                      </>
                    }
                    value={furnishing}
                    onValueChange={(value) => {
                      updatePropertyInfo({
                        furnishing: value as FURNISHING,
                      })
                    }}
                    placeholder={tPlaceholders('selectInteriorCondition')}
                    options={getInteriorConditionOptions(t)}
                    error={
                      error?.message
                        ? tValidation(getValidationKey(error.message))
                        : undefined
                    }
                  />
                </div>
              )}
            />

            {/* Rooms Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {tDetails('rooms')}
              </h3>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Controller
                  name='bedrooms'
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <NumberField
                        label={tDetails('bedrooms')}
                        value={propertyInfo?.bedrooms ?? 0}
                        onChange={(v) => {
                          updatePropertyInfo({ bedrooms: v })
                        }}
                        placeholder='0'
                        min={1}
                        step={1}
                        required
                        error={
                          error?.message
                            ? tValidation(getValidationKey(error.message))
                            : undefined
                        }
                      />
                    </div>
                  )}
                />
                <Controller
                  name='bathrooms'
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <NumberField
                        label={tDetails('bathrooms')}
                        value={propertyInfo?.bathrooms ?? 0}
                        onChange={(v) => {
                          updatePropertyInfo({ bathrooms: v })
                        }}
                        placeholder='0'
                        min={1}
                        step={1}
                        required
                        error={
                          error?.message
                            ? tValidation(getValidationKey(error.message))
                            : undefined
                        }
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Amenities (moved from AI Valuation) */}
            <div className='space-y-4'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                {tValuation('propertyInfo.amenities')}
              </label>
              <div className='max-h-[400px] overflow-y-auto overflow-x-hidden pr-2'>
                <div className='grid grid-cols-2 gap-3'>
                  {getAmenityItems(t).map((amenity) => {
                    const amenityConfig = getAmenityByCode(amenity.key)
                    const IconComponent = amenityConfig?.icon

                    return (
                      <label
                        key={amenity.key}
                        className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          amenityIds?.includes(amenity.id)
                            ? amenity?.color
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent className='w-4 h-4 flex-shrink-0' />
                        )}
                        <input
                          type='checkbox'
                          className='w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 flex-shrink-0'
                          checked={amenityIds?.includes(amenity.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updatePropertyInfo({
                                amenityIds: [
                                  ...(amenityIds || []),
                                  amenity?.id,
                                ],
                              })
                            } else {
                              updatePropertyInfo({
                                amenityIds: amenityIds?.filter(
                                  (a) => a !== amenity?.id,
                                ),
                              })
                            }
                          }}
                        />
                        <span className='text-sm font-medium'>
                          {amenity?.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilities & Structure Card */}
        <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                <DollarSign className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
              {tUtilities('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-8'>
            {/* Monthly Utilities */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                <ZapIcon className='w-5 h-5 text-yellow-500' />
                {tUtilities('monthlyUtilities')}
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Controller
                  name='waterPrice'
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('waterPrice')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={propertyInfo?.waterPrice}
                        onValueChange={(value) => {
                          updatePropertyInfo({
                            waterPrice: value as PriceType,
                          })
                        }}
                        placeholder={tPlaceholders('selectWaterPrice')}
                        options={getUtilityPriceOptions(tUtilities)}
                        error={
                          error?.message
                            ? tValidation(getValidationKey(error.message))
                            : undefined
                        }
                      />
                    </div>
                  )}
                />
                <Controller
                  name='electricityPrice'
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('electricityPrice')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={propertyInfo?.electricityPrice}
                        onValueChange={(value) => {
                          updatePropertyInfo({
                            electricityPrice: value as PriceType,
                          })
                        }}
                        placeholder={tPlaceholders('selectElectricityPrice')}
                        options={getUtilityPriceOptions(tUtilities)}
                        error={
                          error?.message
                            ? tValidation(getValidationKey(error.message))
                            : undefined
                        }
                      />
                    </div>
                  )}
                />
                <Controller
                  name='internetPrice'
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('internetPrice')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={propertyInfo?.internetPrice}
                        onValueChange={(value) => {
                          updatePropertyInfo({
                            internetPrice: value as PriceType,
                          })
                        }}
                        placeholder={tPlaceholders('selectInternetPrice')}
                        options={getInternetOptions(tUtilities)}
                        error={
                          error?.message
                            ? tValidation(getValidationKey(error.message))
                            : undefined
                        }
                      />
                    </div>
                  )}
                />
                <Controller
                  name='serviceFee'
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('serviceFee')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={propertyInfo?.serviceFee}
                        onValueChange={(value) => {
                          updatePropertyInfo({
                            serviceFee: value as PriceType,
                          })
                        }}
                        placeholder={tPlaceholders('selectServiceFee')}
                        options={getUtilityPriceOptions(tUtilities)}
                        error={
                          error?.message
                            ? tValidation(getValidationKey(error.message))
                            : undefined
                        }
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Structure & Direction */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                <Navigation className='w-5 h-5 text-orange-500' />
                {tUtilities('structureDirection')}
              </h3>
              <Controller
                name='direction'
                control={control}
                render={({ fieldState: { error } }) => (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <SelectDropdown
                      label={
                        <>
                          {tUtilities('houseDirection')}
                          <span className='text-destructive ml-1'>*</span>
                        </>
                      }
                      value={propertyInfo?.direction}
                      onValueChange={(value) => {
                        updatePropertyInfo({
                          direction: value as Direction,
                        })
                      }}
                      placeholder={tPlaceholders('selectHouseDirection')}
                      options={getDirectionOptions(tUtilities)}
                      error={
                        error?.message
                          ? tValidation(getValidationKey(error.message))
                          : undefined
                      }
                    />
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Content Card */}
        <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
          <CardHeader className='pb-4'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
              <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
                <div className='p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'>
                  <Zap className='w-6 h-6 text-white' />
                </div>
                {tAI('title')}
              </CardTitle>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto'>
                <SelectDropdown
                  value={aiTone}
                  onValueChange={(value) => {
                    setAiTone(value as 'friendly' | 'professionally')
                  }}
                  placeholder={tAI('selectTone')}
                  options={getToneOptions(tAI)}
                  className='w-full sm:w-[180px]'
                />
                <Button
                  variant='outline'
                  size='sm'
                  className='border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg w-full sm:w-auto'
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  ) : (
                    <Zap className='w-4 h-4 mr-1' />
                  )}
                  {t('generateAutomatically')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Listing Title */}
            <Controller
              name='title'
              control={control}
              render={({ fieldState: { error } }) => (
                <div className='space-y-3'>
                  <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    {tAI('listingTitle')}
                    <span className='text-destructive ml-1'>*</span>
                  </label>
                  <input
                    type='text'
                    value={titleInput}
                    className={`w-full h-12 px-4 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 ${
                      error
                        ? 'border-destructive dark:border-destructive'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    placeholder={tPlaceholders('enterListingTitle')}
                    onChange={(e) => {
                      setTitleInput(e.target.value)
                    }}
                  />
                  {error && (
                    <p className='text-xs text-destructive' role='alert'>
                      {error.message
                        ? tValidation(getValidationKey(error.message))
                        : ''}
                    </p>
                  )}
                  {!error && (
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {tAI('titleLength')}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Property Description */}
            <Controller
              name='description'
              control={control}
              render={({ fieldState: { error } }) => (
                <div className='space-y-3'>
                  <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    {tAI('propertyDescription')}
                    <span className='text-destructive ml-1'>*</span>
                  </label>
                  <textarea
                    value={descriptionInput}
                    className={`w-full h-32 px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 resize-none ${
                      error
                        ? 'border-destructive dark:border-destructive'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    placeholder={tPlaceholders('enterPropertyDescription')}
                    onChange={(e) => {
                      setDescriptionInput(e.target.value)
                    }}
                  />
                  {error && (
                    <p className='text-xs text-destructive' role='alert'>
                      {error.message
                        ? tValidation(getValidationKey(error.message))
                        : ''}
                    </p>
                  )}
                  {!error && (
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {tAI('descriptionHint')}
                    </p>
                  )}
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { PropertyInfoSection }
export type { PropertyInfoSectionProps }
