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
  RotateCcw,
  Home,
  DollarSign,
  User,
  Mail,
  Phone,
  Zap as ZapIcon,
  Navigation,
  Ruler,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import type { PropertyInfo } from '@/contexts/createPost'
import { useLocationContext } from '@/contexts/location'
import {
  getListingTypeOptions,
  getPropertyTypeOptions,
  getInteriorConditionOptions,
  getUtilityPriceOptions,
  getInternetOptions,
  getDirectionOptions,
  getAmenityItems,
} from './index.helper'
import { getAmenityByCode } from '@/constants/amenities'
import { AddressInput } from '@/components/molecules/createPostAddress'
import GoogleMapPicker from '@/components/molecules/googleMapPicker'
import NumberField from '@/components/atoms/number-field'
import { DatePicker } from '@/components/atoms'
import classNames from 'classnames'
import { useGenerateListingDescription } from '@/hooks/useAI'
import { mapFurnishing, mapPropertyType } from '@/utils/ai'
import type { ListingDescriptionRequest } from '@/api/types/ai.type'

interface PropertyInfoSectionProps {
  className?: string
}

const PropertyInfoSection: React.FC<PropertyInfoSectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.propertyInfo')
  const tDetails = useTranslations('createPost.sections.propertyDetails')
  const tUtilities = useTranslations('createPost.sections.utilitiesStructure')
  const tContact = useTranslations('createPost.sections.contactInfo')
  const tValuation = useTranslations('createPost.sections.aiValuation')
  const tAI = useTranslations('createPost.sections.aiContent')
  const tPlaceholders = useTranslations(
    'createPost.sections.utilitiesStructure.placeholders',
  )

  const { propertyInfo, updatePropertyInfo } = useCreatePost()
  const {
    coordinates,
    requestLocation,
    isLoading: locationLoading,
  } = useLocationContext()

  const handleUseMyLocation = async () => {
    const success = await requestLocation()
    if (success && coordinates) {
      updatePropertyInfo({
        coordinates: {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        },
      })
    }
  }

  // Update coordinates when location context changes
  React.useEffect(() => {
    if (coordinates) {
      updatePropertyInfo({
        coordinates: {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        },
      })
    }
  }, [coordinates])

  // AI generation using React Query
  const { mutate: generateAI, isPending: aiLoading } =
    useGenerateListingDescription()

  const handleGenerateAI = () => {
    const req: ListingDescriptionRequest = {
      title: propertyInfo?.listingTitle,
      addressText:
        propertyInfo?.propertyAddress || propertyInfo?.searchAddress || '',
      bedrooms: propertyInfo?.bedrooms,
      bathrooms: propertyInfo?.bathrooms,
      area: propertyInfo?.area,
      price: propertyInfo?.price,
      priceUnit: propertyInfo?.listingType === 'rent' ? 'MONTH' : 'YEAR',
      furnishing: mapFurnishing(propertyInfo?.interiorCondition),
      propertyType: mapPropertyType(propertyInfo?.propertyType),
      tone: 'friendly',
      maxWords: 60,
    }

    generateAI(req, {
      onSuccess: (resp) => {
        const generatedTitle =
          resp.data?.generatedTitle || propertyInfo?.listingTitle || ''
        const generatedDescription =
          resp.data?.generatedDescription ||
          propertyInfo?.propertyDescription ||
          ''

        updatePropertyInfo({
          listingTitle: generatedTitle,
          propertyDescription: generatedDescription,
        })
      },
    })
  }

  // UI simplification toggles based on current property type
  const pType = propertyInfo?.propertyType
  const isHouseLike = pType === 'house' || pType === 'villa'
  const isApartment = pType === 'apartment'
  const isStudio = pType === 'studio'
  const showBedrooms = !isStudio
  const showBathrooms = true
  const showFloors = isHouseLike
  const showHouseDirection = isHouseLike
  const showBalconyDirection = isApartment || pType === 'villa'
  const showDimensions = isHouseLike

  // Helper to prune state fields according to selected property type
  type PropertyTypeUI = PropertyInfo['propertyType']
  const PRUNE_BY_TYPE: Record<PropertyTypeUI, Partial<PropertyInfo>> = {
    apartment: {
      floors: undefined,
      houseDirection: undefined,
      alleyWidth: undefined,
      frontageWidth: undefined,
    },
    house: {
      balconyDirection: undefined,
    },
    villa: {},
    studio: {
      bedrooms: undefined,
      floors: undefined,
      houseDirection: undefined,
      balconyDirection: undefined,
      alleyWidth: undefined,
      frontageWidth: undefined,
    },
  }

  const pruneInfoByPropertyType = (
    newType: PropertyTypeUI,
  ): Partial<PropertyInfo> => ({
    propertyType: newType,
    ...PRUNE_BY_TYPE[newType],
  })

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
            {/* Listing Type */}
            <SelectDropdown
              label={t('listingType')}
              value={propertyInfo?.listingType}
              onValueChange={(value) =>
                updatePropertyInfo({ listingType: value as 'rent' | 'sale' })
              }
              placeholder={tPlaceholders('selectListingType')}
              options={getListingTypeOptions(t)}
            />

            {/* Property Address */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-blue-500' />
                {t('propertyAddress')}
              </label>
              <AddressInput className='w-full' />

              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {t('addressHint')}
              </p>
            </div>

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
                  <Button
                    variant='outline'
                    size='sm'
                    className='border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full sm:w-auto'
                    onClick={() =>
                      updatePropertyInfo({ coordinates: { lat: 0, lng: 0 } })
                    }
                  >
                    <RotateCcw className='w-4 h-4 mr-1' />
                    {t('reset')}
                  </Button>
                </div>
              </div>

              {/* Google Map Picker */}
              <GoogleMapPicker
                latitude={propertyInfo?.coordinates?.lat || 0}
                longitude={propertyInfo?.coordinates?.lng || 0}
                onLocationSelect={(lat, lng) => {
                  updatePropertyInfo({
                    coordinates: { lat, lng },
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
            {/* Property Type */}
            <SelectDropdown
              label={tDetails('propertyType')}
              value={propertyInfo?.propertyType}
              onValueChange={(value) =>
                updatePropertyInfo(
                  pruneInfoByPropertyType(value as PropertyTypeUI),
                )
              }
              placeholder={tPlaceholders('selectPropertyType')}
              options={getPropertyTypeOptions(tDetails)}
            />

            {/* Area and Price Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <NumberField
                label={tDetails('area')}
                value={propertyInfo?.area ?? 0}
                onChange={(v) => updatePropertyInfo({ area: v })}
                placeholder={tPlaceholders('enterArea')}
                suffix='m²'
                min={0}
              />
              <NumberField
                label={tDetails('price')}
                value={propertyInfo?.price ?? 0}
                onChange={(v) => updatePropertyInfo({ price: v })}
                placeholder={tPlaceholders('enterPrice')}
                suffix='VND'
                min={0}
              />
            </div>

            {/* Interior Condition */}
            <SelectDropdown
              label={tDetails('interiorCondition')}
              value={propertyInfo?.interiorCondition}
              onValueChange={(value) =>
                updatePropertyInfo({
                  interiorCondition: value as
                    | 'furnished'
                    | 'semi-furnished'
                    | 'unfurnished',
                })
              }
              placeholder={tPlaceholders('selectInteriorCondition')}
              options={getInteriorConditionOptions(tDetails)}
            />

            {/* Rooms Section */}
            {(showBedrooms || showBathrooms) && (
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {tDetails('rooms')}
                </h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {showBedrooms && (
                    <NumberField
                      label={tDetails('bedrooms')}
                      value={propertyInfo?.bedrooms ?? 0}
                      onChange={(v) => updatePropertyInfo({ bedrooms: v })}
                      placeholder='0'
                      min={0}
                      step={1}
                    />
                  )}
                  {showBathrooms && (
                    <NumberField
                      label={tDetails('bathrooms')}
                      value={propertyInfo?.bathrooms ?? 0}
                      onChange={(v) => updatePropertyInfo({ bathrooms: v })}
                      placeholder='0'
                      min={0}
                      step={1}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Floors */}
            {showFloors && (
              <NumberField
                label={tDetails('floors')}
                value={propertyInfo?.floors ?? 0}
                onChange={(v) => updatePropertyInfo({ floors: v })}
                placeholder='0'
                min={0}
                step={1}
              />
            )}

            {/* Move-in Date */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {tDetails('moveInDate')}
              </label>
              <DatePicker
                value={propertyInfo?.moveInDate}
                onChange={(date) => updatePropertyInfo({ moveInDate: date })}
                placeholder={tPlaceholders('dateFormat')}
              />
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {tDetails('dateFormat')}
              </p>
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
                          propertyInfo?.amenities?.includes(amenity.key)
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
                          checked={propertyInfo?.amenities?.includes(
                            amenity.key,
                          )}
                          onChange={(e) => {
                            const currentAmenities =
                              propertyInfo?.amenities || []
                            if (e.target.checked) {
                              updatePropertyInfo({
                                amenities: [...currentAmenities, amenity.key],
                              })
                            } else {
                              updatePropertyInfo({
                                amenities: currentAmenities.filter(
                                  (a) => a !== amenity.key,
                                ),
                              })
                            }
                          }}
                        />
                        <span className='text-sm font-medium'>
                          {amenity.label}
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
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <SelectDropdown
                  label={tUtilities('waterPrice')}
                  value={propertyInfo?.waterPrice}
                  onValueChange={(value) =>
                    updatePropertyInfo({
                      waterPrice: value as 'provider' | 'fixed' | 'negotiable',
                    })
                  }
                  placeholder={tPlaceholders('selectWaterPrice')}
                  options={getUtilityPriceOptions(tUtilities)}
                />
                <SelectDropdown
                  label={tUtilities('electricityPrice')}
                  value={propertyInfo?.electricityPrice}
                  onValueChange={(value) =>
                    updatePropertyInfo({
                      electricityPrice: value as
                        | 'provider'
                        | 'fixed'
                        | 'negotiable',
                    })
                  }
                  placeholder={tPlaceholders('selectElectricityPrice')}
                  options={getUtilityPriceOptions(tUtilities)}
                />
                <SelectDropdown
                  className='sm:col-span-2 lg:col-span-1'
                  label={tUtilities('internetPrice')}
                  value={propertyInfo?.internetPrice}
                  onValueChange={(value) =>
                    updatePropertyInfo({
                      internetPrice: value as
                        | 'landlord'
                        | 'tenant'
                        | 'included',
                    })
                  }
                  placeholder={tPlaceholders('selectInternetPrice')}
                  options={getInternetOptions(tUtilities)}
                />
              </div>
            </div>

            {/* Structure & Direction */}
            {(showHouseDirection || showBalconyDirection) && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                  <Navigation className='w-5 h-5 text-orange-500' />
                  {tUtilities('structureDirection')}
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {showHouseDirection && (
                    <SelectDropdown
                      label={tUtilities('houseDirection')}
                      value={propertyInfo?.houseDirection}
                      onValueChange={(value) =>
                        updatePropertyInfo({
                          houseDirection: value as
                            | 'north'
                            | 'south'
                            | 'east'
                            | 'west'
                            | 'northeast'
                            | 'northwest'
                            | 'southeast'
                            | 'southwest',
                        })
                      }
                      placeholder={tPlaceholders('selectHouseDirection')}
                      options={getDirectionOptions(tUtilities)}
                    />
                  )}
                  {showBalconyDirection && (
                    <SelectDropdown
                      label={tUtilities('balconyDirection')}
                      value={propertyInfo?.balconyDirection}
                      onValueChange={(value) =>
                        updatePropertyInfo({
                          balconyDirection: value as
                            | 'north'
                            | 'south'
                            | 'east'
                            | 'west'
                            | 'northeast'
                            | 'northwest'
                            | 'southeast'
                            | 'southwest',
                        })
                      }
                      placeholder={tPlaceholders('selectBalconyDirection')}
                      options={getDirectionOptions(tUtilities)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Property Dimensions */}
            {showDimensions && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                  <Ruler className='w-5 h-5 text-indigo-500' />
                  {tUtilities('propertyDimensions')}
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <NumberField
                    label={tUtilities('alleyWidth')}
                    value={propertyInfo?.alleyWidth ?? 0}
                    onChange={(v) => updatePropertyInfo({ alleyWidth: v })}
                    placeholder='0'
                    suffix='m'
                    min={0}
                    step={0.1}
                  />
                  <NumberField
                    label={tUtilities('frontageWidth')}
                    value={propertyInfo?.frontageWidth ?? 0}
                    onChange={(v) => updatePropertyInfo({ frontageWidth: v })}
                    placeholder='0'
                    suffix='m'
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                <User className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
              {tContact('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {tContact('fullName')}
                </label>
                <div className='relative group'>
                  <User className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                  <input
                    type='text'
                    className='w-full h-12 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                    placeholder={tPlaceholders('enterFullName')}
                    value={propertyInfo?.fullName}
                    onChange={(e) =>
                      updatePropertyInfo({ fullName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className='space-y-3'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {tContact('email')}
                </label>
                <div className='relative group'>
                  <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                  <input
                    type='email'
                    className='w-full h-12 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                    placeholder={tPlaceholders('enterEmail')}
                    value={propertyInfo?.email}
                    onChange={(e) =>
                      updatePropertyInfo({ email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className='space-y-3 sm:col-span-2 lg:col-span-1'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {tContact('phoneNumber')}
                </label>
                <div className='relative group'>
                  <Phone className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                  <input
                    type='tel'
                    className='w-full h-12 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                    placeholder={tPlaceholders('enterPhoneNumber')}
                    value={propertyInfo?.phoneNumber}
                    onChange={(e) =>
                      updatePropertyInfo({ phoneNumber: e.target.value })
                    }
                  />
                </div>
              </div>
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
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Listing Title */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {tAI('listingTitle')}
              </label>
              <input
                type='text'
                className='w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                placeholder={tPlaceholders('enterListingTitle')}
                value={propertyInfo?.listingTitle}
                onChange={(e) =>
                  updatePropertyInfo({ listingTitle: e.target.value })
                }
              />
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {tAI('titleLength')}
              </p>
            </div>

            {/* Property Description */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {tAI('propertyDescription')}
              </label>
              <textarea
                className='w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 resize-none'
                placeholder={tPlaceholders('enterPropertyDescription')}
                value={propertyInfo?.propertyDescription}
                onChange={(e) =>
                  updatePropertyInfo({ propertyDescription: e.target.value })
                }
              />
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {tAI('descriptionHint')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { PropertyInfoSection }
export type { PropertyInfoSectionProps }
