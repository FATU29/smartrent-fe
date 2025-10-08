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
  Search,
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
  Building,
  Users,
  Wifi,
  Car,
  ChefHat,
  CheckCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import {
  getListingTypeOptions,
  getPropertyTypeOptions,
  getInteriorConditionOptions,
  getUtilityPriceOptions,
  getInternetOptions,
  getDirectionOptions,
  getAmenityItems,
} from './index.helper'
import {
  getProvinceOptions,
  getDistrictOptions,
  getWardOptions,
} from './index.helper'
import NumberField from '@/components/atoms/number-field'

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

  return (
    <div className={className}>
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
              value={propertyInfo.listingType}
              onValueChange={(value) =>
                updatePropertyInfo({ listingType: value as 'rent' | 'sale' })
              }
              placeholder={tPlaceholders('selectListingType')}
              options={getListingTypeOptions(t)}
            />

            {/* Property Address with mode toggle */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-blue-500' />
                {t('propertyAddress')}
              </label>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>
                  {tValuation('propertyInfo.addressMode')}
                </span>
                <div className='flex items-center gap-2 text-xs'>
                  <button
                    className={`px-2 py-1 rounded border ${propertyInfo.addressMode !== 'freeText' ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground/80'}`}
                    onClick={() =>
                      updatePropertyInfo({ addressMode: 'structured' })
                    }
                    type='button'
                  >
                    {tValuation('propertyInfo.addressModes.structured')}
                  </button>
                  <button
                    className={`px-2 py-1 rounded border ${propertyInfo.addressMode === 'freeText' ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground/80'}`}
                    onClick={() =>
                      updatePropertyInfo({ addressMode: 'freeText' })
                    }
                    type='button'
                  >
                    {tValuation('propertyInfo.addressModes.freeText')}
                  </button>
                </div>
              </div>
              {propertyInfo.addressMode === 'freeText' ? (
                <div className='relative group'>
                  <MapPin className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                  <input
                    type='text'
                    className='w-full h-12 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                    placeholder={t('addressPlaceholder')}
                    value={propertyInfo.propertyAddress}
                    onChange={(e) =>
                      updatePropertyInfo({ propertyAddress: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <SelectDropdown
                    label={tValuation('propertyInfo.province')}
                    value={propertyInfo.province || 'hcmc'}
                    onValueChange={(value) =>
                      updatePropertyInfo({ province: value })
                    }
                    options={getProvinceOptions(tValuation)}
                    className='space-y-2'
                  />
                  <SelectDropdown
                    label={tValuation('propertyInfo.districtLabel')}
                    value={propertyInfo.district}
                    onValueChange={(value) =>
                      updatePropertyInfo({ district: value })
                    }
                    options={getDistrictOptions(tValuation)}
                    className='space-y-2'
                  />
                  <SelectDropdown
                    label={tValuation('propertyInfo.ward')}
                    value={propertyInfo.ward}
                    onValueChange={(value) =>
                      updatePropertyInfo({ ward: value })
                    }
                    options={getWardOptions(tValuation)}
                    className='space-y-2'
                  />
                </div>
              )}
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {t('addressHint')}
              </p>

              {/* Search Field */}
              <div className='relative group'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors' />
                <input
                  type='text'
                  className='w-full h-12 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                  placeholder={t('searchAddress')}
                  value={propertyInfo.searchAddress}
                  onChange={(e) =>
                    updatePropertyInfo({ searchAddress: e.target.value })
                  }
                />
              </div>
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
                  >
                    <Send className='w-4 h-4 mr-1' />
                    {t('useMyLocation')}
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg w-full sm:w-auto'
                  >
                    <RotateCcw className='w-4 h-4 mr-1' />
                    {t('reset')}
                  </Button>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className='w-full h-64 bg-gradient-to-r from-green-100 to-red-100 dark:from-green-900/20 dark:to-red-900/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center relative'>
                <div className='text-center'>
                  <MapPin className='w-8 h-8 text-blue-500 mx-auto mb-2' />
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('interactiveMap')}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                    {t('district')} 5, HCMC
                  </p>
                  <div className='absolute bottom-2 left-2 bg-card border px-2 py-1 rounded-lg text-xs shadow-sm'>
                    <div className='flex items-center gap-1'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      {t('selectedLocation')}
                    </div>
                  </div>
                  <div className='absolute bottom-2 right-2 bg-card border px-2 py-1 rounded-lg text-xs shadow-sm'>
                    {t('zoom')}: 15
                  </div>
                  <div className='absolute top-2 left-2 bg-card border px-2 py-1 rounded-lg text-xs shadow-sm'>
                    {t('district')} 5, HCMC
                  </div>
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                    <div className='w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800'></div>
                  </div>
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-2 text-xs bg-card border px-1 rounded shadow-sm'>
                    {t('coordinates')}: {propertyInfo.coordinates.lat},{' '}
                    {propertyInfo.coordinates.lng}
                  </div>
                </div>
              </div>

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
              placeholder={tPlaceholders('selectPropertyType')}
              options={getPropertyTypeOptions(tDetails)}
            />

            {/* Area and Price Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <NumberField
                label={tDetails('area')}
                value={propertyInfo.area}
                onChange={(v) => updatePropertyInfo({ area: v })}
                placeholder={tPlaceholders('enterArea')}
                suffix='m²'
                min={0}
              />
              <NumberField
                label={tDetails('price')}
                value={propertyInfo.price}
                onChange={(v) => updatePropertyInfo({ price: v })}
                placeholder={tPlaceholders('enterPrice')}
                suffix='VND'
                min={0}
              />
            </div>

            {/* Interior Condition */}
            <SelectDropdown
              label={tDetails('interiorCondition')}
              value={propertyInfo.interiorCondition}
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
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {tDetails('rooms')}
              </h3>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <NumberField
                  label={tDetails('bedrooms')}
                  value={propertyInfo.bedrooms}
                  onChange={(v) => updatePropertyInfo({ bedrooms: v })}
                  placeholder='0'
                  min={0}
                  step={1}
                />
                <NumberField
                  label={tDetails('bathrooms')}
                  value={propertyInfo.bathrooms}
                  onChange={(v) => updatePropertyInfo({ bathrooms: v })}
                  placeholder='0'
                  min={0}
                  step={1}
                />
              </div>
            </div>

            {/* Floors */}
            <NumberField
              label={tDetails('floors')}
              value={propertyInfo.floors}
              onChange={(v) => updatePropertyInfo({ floors: v })}
              placeholder='0'
              min={0}
              step={1}
            />

            {/* Move-in Date */}
            <div className='space-y-3'>
              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {tDetails('moveInDate')}
              </label>
              <div className='relative'>
                <input
                  type='text'
                  className='w-full h-12 px-4 pr-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                  placeholder={tPlaceholders('dateFormat')}
                  value={propertyInfo.moveInDate}
                  onChange={(e) =>
                    updatePropertyInfo({ moveInDate: e.target.value })
                  }
                />
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                  <svg
                    className='w-4 h-4 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
              </div>
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
              <div className='grid grid-cols-2 gap-3'>
                {getAmenityItems(tValuation).map((amenity) => (
                  <label
                    key={amenity.key}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      propertyInfo.amenities.includes(amenity.key)
                        ? amenity.color
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {/* map icon by key */}
                    {amenity.key === 'furnished' && (
                      <Home className='w-4 h-4' />
                    )}
                    {amenity.key === 'aircon' && (
                      <Building className='w-4 h-4' />
                    )}
                    {amenity.key === 'toilet' && <Users className='w-4 h-4' />}
                    {amenity.key === 'wifi' && <Wifi className='w-4 h-4' />}
                    {amenity.key === 'parking' && <Car className='w-4 h-4' />}
                    {amenity.key === 'elevator' && (
                      <Building className='w-4 h-4' />
                    )}
                    {amenity.key === 'balcony' && <Ruler className='w-4 h-4' />}
                    {amenity.key === 'kitchen' && (
                      <ChefHat className='w-4 h-4' />
                    )}
                    <input
                      type='checkbox'
                      className='w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2'
                      checked={propertyInfo.amenities.includes(amenity.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updatePropertyInfo({
                            amenities: [...propertyInfo.amenities, amenity.key],
                          })
                        } else {
                          updatePropertyInfo({
                            amenities: propertyInfo.amenities.filter(
                              (a) => a !== amenity.key,
                            ),
                          })
                        }
                      }}
                    />
                    <span className='text-sm font-medium'>{amenity.label}</span>
                  </label>
                ))}
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
                  value={propertyInfo.waterPrice}
                  onValueChange={(value) =>
                    updatePropertyInfo({
                      waterPrice: value as 'provider' | 'fixed' | 'negotiable',
                    })
                  }
                  options={getUtilityPriceOptions(tUtilities)}
                />
                <SelectDropdown
                  label={tUtilities('electricityPrice')}
                  value={propertyInfo.electricityPrice}
                  onValueChange={(value) =>
                    updatePropertyInfo({
                      electricityPrice: value as
                        | 'provider'
                        | 'fixed'
                        | 'negotiable',
                    })
                  }
                  options={getUtilityPriceOptions(tUtilities)}
                />
                <SelectDropdown
                  className='sm:col-span-2 lg:col-span-1'
                  label={tUtilities('internetPrice')}
                  value={propertyInfo.internetPrice}
                  onValueChange={(value) =>
                    updatePropertyInfo({
                      internetPrice: value as
                        | 'landlord'
                        | 'tenant'
                        | 'included',
                    })
                  }
                  options={getInternetOptions(tUtilities)}
                />
              </div>
            </div>

            {/* Structure & Direction */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                <Navigation className='w-5 h-5 text-orange-500' />
                {tUtilities('structureDirection')}
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <SelectDropdown
                  label={tUtilities('houseDirection')}
                  value={propertyInfo.houseDirection}
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
                <SelectDropdown
                  label={tUtilities('balconyDirection')}
                  value={propertyInfo.balconyDirection}
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
              </div>
            </div>

            {/* Property Dimensions */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                <Ruler className='w-5 h-5 text-indigo-500' />
                {tUtilities('propertyDimensions')}
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <NumberField
                  label={tUtilities('alleyWidth')}
                  value={propertyInfo.alleyWidth}
                  onChange={(v) => updatePropertyInfo({ alleyWidth: v })}
                  placeholder='0'
                  suffix='m'
                  min={0}
                  step={0.1}
                />
                <NumberField
                  label={tUtilities('frontageWidth')}
                  value={propertyInfo.frontageWidth}
                  onChange={(v) => updatePropertyInfo({ frontageWidth: v })}
                  placeholder='0'
                  suffix='m'
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
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
                    value={propertyInfo.fullName}
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
                    value={propertyInfo.email}
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
                    value={propertyInfo.phoneNumber}
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
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100'>
              <div className='p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'>
                <Zap className='w-6 h-6 text-white' />
              </div>
              {tAI('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Listing Title */}
            <div className='space-y-3'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {tAI('listingTitle')}
                </label>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg w-full sm:w-auto'
                >
                  <Zap className='w-4 h-4 mr-1' />
                  {t('generateAutomatically')}
                </Button>
              </div>
              <input
                type='text'
                className='w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                placeholder={tPlaceholders('enterListingTitle')}
                value={propertyInfo.listingTitle}
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
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  {tAI('propertyDescription')}
                </label>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg w-full sm:w-auto'
                >
                  <Zap className='w-4 h-4 mr-1' />
                  {t('generateAutomatically')}
                </Button>
              </div>
              <textarea
                className='w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 resize-none'
                placeholder={tPlaceholders('enterPropertyDescription')}
                value={propertyInfo.propertyDescription}
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
