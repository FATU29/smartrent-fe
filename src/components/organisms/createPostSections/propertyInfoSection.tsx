import React from 'react'
import dynamic from 'next/dynamic'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Textarea } from '@/components/atoms/textarea'
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
  Bot,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFormContext, Controller } from 'react-hook-form'
import { useCreatePost } from '@/contexts/createPost'
import { useRouter } from 'next/router'
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
import NumberField from '@/components/atoms/number-field'
import classNames from 'classnames'
import { useGenerateListingDescription } from '@/hooks/useAI'
import type { ListingDescriptionRequest } from '@/api/types/ai.type'
import { toast } from 'sonner'

const GoogleMapPicker = dynamic(
  () => import('@/components/molecules/googleMapPicker'),
  { ssr: false },
)

interface PropertyInfoSectionProps {
  className?: string
  attemptedSubmit?: boolean
}

const PropertyInfoSection: React.FC<PropertyInfoSectionProps> = ({
  className,
  attemptedSubmit = false,
}) => {
  const router = useRouter()
  const isUpdateMode = router.pathname.includes('/update-post')

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

  const { control, setValue, trigger } =
    useFormContext<Partial<CreateListingRequest>>()

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

  const [titleInput, setTitleInput] = React.useState<string>(title || '')
  const [descriptionInput, setDescriptionInput] = React.useState<string>(
    description || '',
  )

  // Track if user has interacted with these fields
  const [titleTouched, setTitleTouched] = React.useState(false)
  const [descriptionTouched, setDescriptionTouched] = React.useState(false)

  // Track if we're updating from AI generation to prevent sync issues
  const isAIGenerating = React.useRef(false)

  const { latitude, longitude } = address || {}

  // Only sync from context when NOT touched by user and NOT during AI generation
  React.useEffect(() => {
    if (
      !titleTouched &&
      !isAIGenerating.current &&
      title !== undefined &&
      title !== ''
    ) {
      setTitleInput(title)
    }
  }, [title, titleTouched])

  React.useEffect(() => {
    if (
      !descriptionTouched &&
      !isAIGenerating.current &&
      description !== undefined &&
      description !== ''
    ) {
      setDescriptionInput(description)
    }
  }, [description, descriptionTouched])

  // Update context and form when user types (with debounce effect via local state)
  React.useEffect(() => {
    if (titleTouched && titleInput !== title) {
      const timer = setTimeout(() => {
        updatePropertyInfo({ title: titleInput })
        setValue('title', titleInput, { shouldValidate: true })
        trigger('title')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [titleInput, titleTouched, title, updatePropertyInfo, setValue, trigger])

  React.useEffect(() => {
    if (descriptionTouched && descriptionInput !== description) {
      const timer = setTimeout(() => {
        updatePropertyInfo({ description: descriptionInput })
        setValue('description', descriptionInput, { shouldValidate: true })
        trigger('description')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [
    descriptionInput,
    descriptionTouched,
    description,
    updatePropertyInfo,
    setValue,
    trigger,
  ])

  const isInitialMount = React.useRef(true)

  React.useEffect(() => {
    const shouldValidate = !isInitialMount.current

    if (propertyInfo?.categoryId) {
      setValue('categoryId', propertyInfo?.categoryId, {
        shouldValidate,
      })
    }
    if (propertyInfo?.productType) {
      setValue('productType', propertyInfo?.productType, {
        shouldValidate,
      })
    }

    if (propertyInfo?.address) {
      const address = propertyInfo.address
      const hasValidCoords =
        address.latitude !== undefined &&
        address.longitude !== undefined &&
        address.latitude !== 0 &&
        address.longitude !== 0
      const hasNewAddress = !!(
        address.newAddress?.provinceCode && address.newAddress?.wardCode
      )
      const hasLegacy = !!address.legacy

      const shouldValidateAddress: boolean =
        shouldValidate && (hasValidCoords || hasNewAddress || hasLegacy)

      setValue('address', propertyInfo?.address, {
        shouldValidate: shouldValidateAddress,
      })
    }
    if (propertyInfo.area) {
      setValue('area', propertyInfo?.area, { shouldValidate: false })
    }
    if (propertyInfo?.price) {
      setValue('price', propertyInfo?.price, { shouldValidate: false })
    }
    if (propertyInfo?.priceUnit) {
      setValue('priceUnit', propertyInfo?.priceUnit, { shouldValidate: false })
    }
    if (propertyInfo?.title) {
      setValue('title', propertyInfo?.title, { shouldValidate: false })
    }
    if (propertyInfo.description) {
      setValue('description', propertyInfo?.description, {
        shouldValidate: false,
      })
    }
    if (propertyInfo?.waterPrice) {
      setValue('waterPrice', propertyInfo?.waterPrice, {
        shouldValidate: false,
      })
    }
    if (propertyInfo?.electricityPrice) {
      setValue('electricityPrice', propertyInfo?.electricityPrice, {
        shouldValidate: false,
      })
    }
    if (propertyInfo?.internetPrice) {
      setValue('internetPrice', propertyInfo?.internetPrice, {
        shouldValidate: false,
      })
    }
    if (propertyInfo?.serviceFee) {
      setValue('serviceFee', propertyInfo?.serviceFee, {
        shouldValidate: false,
      })
    }
    if (propertyInfo?.furnishing) {
      setValue('furnishing', propertyInfo?.furnishing, {
        shouldValidate: false,
      })
    }
    if (propertyInfo?.bedrooms) {
      setValue('bedrooms', propertyInfo?.bedrooms, { shouldValidate: false })
    }
    if (propertyInfo.bathrooms) {
      setValue('bathrooms', propertyInfo?.bathrooms, { shouldValidate: false })
    }
    if (propertyInfo?.roomCapacity) {
      setValue('roomCapacity', propertyInfo?.roomCapacity, {
        shouldValidate: false,
      })
    }
    if (propertyInfo?.direction) {
      setValue('direction', propertyInfo?.direction, { shouldValidate: false })
    }

    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [propertyInfo, setValue])

  const handleUseMyLocation = async () => {
    await requestLocation()
    if (coordinates) {
      const currentAddress = propertyInfo?.address || {}
      updatePropertyInfo({
        address: {
          ...currentAddress,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      })
      setValue(
        'address',
        {
          ...currentAddress,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        { shouldValidate: true, shouldDirty: true },
      )
      trigger('address')
    }
  }

  const handleGenerateAI = () => {
    const categoryItem = categoryId
      ? categories.find((c) => c.categoryId === categoryId)
      : null
    const categoryName = categoryItem?.icon || categoryItem?.name || ''

    const amenityCodes: string[] = []
    if (amenityIds && amenityIds.length > 0) {
      amenityIds.forEach((id) => {
        const amenity = AMENITIES_CONFIG.find((a) => a.id === id)
        if (amenity) {
          amenityCodes.push(amenity.code)
        }
      })
    }

    const hasNewAddress = !!(
      propertyInfo?.address?.newAddress?.provinceCode &&
      propertyInfo?.address?.newAddress?.wardCode
    )
    const hasValidCoordinates =
      propertyInfo?.address?.latitude !== undefined &&
      propertyInfo?.address?.longitude !== undefined &&
      propertyInfo?.address?.latitude !== 0 &&
      propertyInfo?.address?.longitude !== 0

    const orderedChecks: Array<{
      field?: keyof CreateListingRequest
      messageKey: string
      isValid: boolean
    }> = [
      {
        field: 'categoryId',
        messageKey: 'categoryTypeRequired',
        isValid: !!categoryId,
      },
      {
        field: 'productType',
        messageKey: 'propertyTypeRequired',
        isValid: !!productType,
      },
      {
        field: 'address',
        messageKey: 'addressRequired',
        isValid: hasNewAddress,
      },
      {
        field: 'address',
        messageKey: 'locationRequired',
        isValid: hasValidCoordinates,
      },
      {
        field: 'area',
        messageKey: 'areaRequired',
        isValid: !!propertyInfo?.area,
      },
      {
        field: 'price',
        messageKey: 'priceRequired',
        isValid: !!propertyInfo?.price && propertyInfo.price > 0,
      },
      {
        field: 'priceUnit',
        messageKey: 'priceUnitRequired',
        isValid: !!propertyInfo?.priceUnit,
      },
      {
        field: 'furnishing',
        messageKey: 'interiorConditionRequired',
        isValid: !!furnishing,
      },
      {
        field: 'bedrooms',
        messageKey: 'bedroomsRequired',
        isValid: !!propertyInfo?.bedrooms,
      },
      {
        field: 'bathrooms',
        messageKey: 'bathroomsRequired',
        isValid: !!propertyInfo?.bathrooms,
      },
      {
        field: 'roomCapacity',
        messageKey: 'roomCapacityRequired',
        isValid: !!propertyInfo?.roomCapacity,
      },
      {
        field: 'waterPrice',
        messageKey: 'waterPriceRequired',
        isValid: !!propertyInfo?.waterPrice,
      },
      {
        field: 'electricityPrice',
        messageKey: 'electricityPriceRequired',
        isValid: !!propertyInfo?.electricityPrice,
      },
      {
        field: 'internetPrice',
        messageKey: 'internetPriceRequired',
        isValid: !!propertyInfo?.internetPrice,
      },
      {
        field: 'serviceFee',
        messageKey: 'serviceFeeRequired',
        isValid: !!propertyInfo?.serviceFee,
      },
      {
        field: 'direction',
        messageKey: 'directionRequired',
        isValid: !!propertyInfo?.direction,
      },
    ]

    const firstInvalid = orderedChecks.find((check) => !check.isValid)
    if (firstInvalid) {
      if (firstInvalid.field) {
        trigger(firstInvalid.field)
      }
      toast.error(tValidation(firstInvalid.messageKey))
      return
    }

    const req: ListingDescriptionRequest = {
      category: categoryName,
      propertyType: productType,
      price: propertyInfo.price,
      priceUnit: propertyInfo.priceUnit,
      addressText: {
        newAddress: composedNewAddress || '',
        legacy: composedLegacyAddress || composedNewAddress || '',
      },
      area: propertyInfo.area,
      bedrooms: propertyInfo.bedrooms,
      bathrooms: propertyInfo.bathrooms,
      roomCapacity: propertyInfo.roomCapacity,
      direction: propertyInfo.direction,
      furnishing: furnishing,
      amenities: amenityCodes,
      waterPrice: propertyInfo.waterPrice,
      electricityPrice: propertyInfo.electricityPrice,
      internetPrice: propertyInfo.internetPrice,
      serviceFee: propertyInfo.serviceFee,
      tone: aiTone,
      titleMaxWords: 200,
      titleMinWords: 30,
      descriptionMinWords: 100,
    }

    generateAI(req, {
      onSuccess: (resp) => {
        const generatedTitle = resp.data?.title || title || ''
        const generatedDescription = resp.data?.description || description || ''

        // Set flag to prevent sync issues during AI generation
        isAIGenerating.current = true

        // Update local input state immediately
        setTitleInput(generatedTitle)
        setDescriptionInput(generatedDescription)

        // Update context
        updatePropertyInfo({
          title: generatedTitle,
          description: generatedDescription,
        })

        // Update form values without validation (AI generated content shouldn't auto-validate)
        setValue('title', generatedTitle, { shouldValidate: false })
        setValue('description', generatedDescription, { shouldValidate: false })

        // Reset flag after a short delay
        setTimeout(() => {
          isAIGenerating.current = false
        }, 100)
      },
    })
  }

  return (
    <div className={classNames(className)}>
      {/* Layout Wrapper */}
      <div className='space-y-10'>
        {/* Main Property Information Card */}
        <Card className='mb-6 shadow-lg border'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-foreground'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                <FileText className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
              {isUpdateMode ? t('updateListingInfo') : t('listingInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Category Type */}
            <Controller
              name='categoryId'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div className='space-y-2'>
                  <SelectDropdown
                    label={
                      <>
                        {t('categoryType')}
                        <span className='text-destructive ml-1'>*</span>
                      </>
                    }
                    value={(field.value ?? categoryId)?.toString()}
                    onValueChange={(value) => {
                      field.onChange(Number(value))
                      updatePropertyInfo({
                        categoryId: Number(value),
                      })
                      trigger('categoryId')
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
              render={({ field, fieldState: { error } }) => (
                <div className='space-y-2'>
                  <SelectDropdown
                    label={
                      <>
                        {tDetails('propertyType')}
                        <span className='text-destructive ml-1'>*</span>
                      </>
                    }
                    value={(field.value ?? productType)?.toLowerCase()}
                    onValueChange={(value) => {
                      const upperValue = value.toUpperCase() as PropertyType
                      field.onChange(upperValue)
                      updatePropertyInfo({
                        productType: upperValue,
                      })
                      trigger('productType')
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
              render={({ fieldState: { error } }) => {
                const addressErrorKey = getValidationKey(error?.message)
                const shouldShowAddressInputError =
                  attemptedSubmit &&
                  ['addressRequired', 'legacyAddressRequired'].includes(
                    addressErrorKey,
                  )

                return (
                  <div className='space-y-3'>
                    <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
                      <MapPin className='w-4 h-4 text-blue-500' />
                      {t('propertyAddress')}
                      <span className='text-destructive ml-1'>*</span>
                    </label>
                    <AddressInput
                      className='w-full'
                      error={
                        shouldShowAddressInputError
                          ? tValidation(addressErrorKey)
                          : undefined
                      }
                    />
                  </div>
                )
              }}
            />

            {/* Map Preview */}
            <Controller
              name='address'
              control={control}
              render={({ fieldState: { error } }) => (
                <div className='space-y-4'>
                  {/* Make header responsive: stack on mobile, inline on sm+ */}
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                    <h3 className='text-sm font-semibold text-foreground whitespace-normal break-words leading-snug'>
                      {t('mapPreview')}
                      <span className='text-destructive ml-1'>*</span>
                    </h3>
                    <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='border-2 border-border hover:bg-muted rounded-lg w-full sm:w-auto'
                        onClick={handleUseMyLocation}
                        disabled={locationLoading}
                      >
                        <Send className='w-4 h-4 mr-1' />
                        {locationLoading ? t('loading') : t('useMyLocation')}
                      </Button>
                    </div>
                  </div>

                  {/* Google Map Picker - Only show if coordinates exist */}
                  {latitude && longitude ? (
                    <GoogleMapPicker
                      latitude={latitude}
                      longitude={longitude}
                      onLocationSelect={(lat, lng) => {
                        const currentAddress = propertyInfo?.address || {}
                        updatePropertyInfo({
                          address: {
                            ...currentAddress,
                            latitude: lat,
                            longitude: lng,
                          },
                        })
                        setValue(
                          'address',
                          {
                            ...currentAddress,
                            latitude: lat,
                            longitude: lng,
                          },
                          { shouldValidate: true, shouldDirty: true },
                        )
                        trigger('address')
                      }}
                    />
                  ) : (
                    <div className='relative w-full h-64 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/50 flex items-center justify-center'>
                      <div className='text-center p-6'>
                        <MapPin className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
                        <p className='text-sm font-medium text-muted-foreground mb-2'>
                          {t('mapNotSelected')}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {t('clickButtonToSelectLocation')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Validation Error Message - only show when user attempts to proceed */}
                  {attemptedSubmit && error?.message && (
                    <div className='flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg'>
                      <MapPin className='w-4 h-4 text-destructive flex-shrink-0 mt-0.5' />
                      <p className='text-sm text-destructive font-medium'>
                        {tValidation(getValidationKey(error.message))}
                      </p>
                    </div>
                  )}

                  <div className='text-xs text-muted-foreground space-y-1'>
                    <p>{t('dragMarker')}</p>
                    <p>{t('searchAddresses')}</p>
                    <p className='flex items-center gap-1'>
                      <MapPin className='w-3 h-3' />
                      {t('interactiveMap')}
                    </p>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Property Details Card */}
        <Card className='mb-6 shadow-lg border'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-foreground'>
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
                        setValue('area', v, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        trigger('area')
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
                        setValue('price', v, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        trigger('price')
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
                render={({ field, fieldState: { error } }) => (
                  <div className='space-y-2'>
                    <SelectDropdown
                      label={tDetails('priceUnit')}
                      value={field.value || propertyInfo?.priceUnit}
                      onValueChange={(v) => {
                        field.onChange(v)
                        updatePropertyInfo({ priceUnit: v as PriceUnit })
                        trigger('priceUnit')
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
              render={({ field, fieldState: { error } }) => (
                <div className='space-y-2'>
                  <SelectDropdown
                    label={
                      <>
                        {tDetails('interiorCondition')}
                        <span className='text-destructive ml-1'>*</span>
                      </>
                    }
                    value={field.value || furnishing}
                    onValueChange={(value) => {
                      field.onChange(value)
                      updatePropertyInfo({
                        furnishing: value as FURNISHING,
                      })
                      trigger('furnishing')
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
              <h3 className='text-sm font-semibold text-foreground'>
                {tDetails('rooms')}
              </h3>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
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
                          setValue('bedrooms', v, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                          trigger('bedrooms')
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
                          setValue('bathrooms', v, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                          trigger('bathrooms')
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
                  name='roomCapacity'
                  control={control}
                  render={({ fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <NumberField
                        label={tDetails('roomCapacity')}
                        value={propertyInfo?.roomCapacity ?? 0}
                        onChange={(v) => {
                          updatePropertyInfo({ roomCapacity: v })
                          setValue('roomCapacity', v, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          })
                          trigger('roomCapacity')
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
              <label className='text-sm font-semibold text-foreground flex items-center gap-2'>
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
                        className='flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-muted border-border text-muted-foreground hover:bg-accent focus-within:border-primary focus-within:bg-primary/5'
                      >
                        {IconComponent && (
                          <IconComponent className='w-4 h-4 flex-shrink-0' />
                        )}
                        <input
                          type='checkbox'
                          className='w-4 h-4 rounded border-2 border-input text-primary focus:ring-0 focus:outline-none focus-visible:outline-none flex-shrink-0'
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
        <Card className='mb-6 shadow-lg border'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-xl font-semibold text-foreground'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                <DollarSign className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
              {tUtilities('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-8'>
            {/* Monthly Utilities */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                <ZapIcon className='w-5 h-5 text-yellow-500' />
                {tUtilities('monthlyUtilities')}
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Controller
                  name='waterPrice'
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('waterPrice')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={field.value || propertyInfo?.waterPrice}
                        onValueChange={(value) => {
                          field.onChange(value)
                          updatePropertyInfo({
                            waterPrice: value as PriceType,
                          })
                          trigger('waterPrice')
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
                  render={({ field, fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('electricityPrice')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={field.value || propertyInfo?.electricityPrice}
                        onValueChange={(value) => {
                          field.onChange(value)
                          updatePropertyInfo({
                            electricityPrice: value as PriceType,
                          })
                          trigger('electricityPrice')
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
                  render={({ field, fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('internetPrice')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={field.value || propertyInfo?.internetPrice}
                        onValueChange={(value) => {
                          field.onChange(value)
                          updatePropertyInfo({
                            internetPrice: value as PriceType,
                          })
                          trigger('internetPrice')
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
                  render={({ field, fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <SelectDropdown
                        label={
                          <>
                            {tUtilities('serviceFee')}
                            <span className='text-destructive ml-1'>*</span>
                          </>
                        }
                        value={field.value || propertyInfo?.serviceFee}
                        onValueChange={(value) => {
                          field.onChange(value)
                          updatePropertyInfo({
                            serviceFee: value as PriceType,
                          })
                          trigger('serviceFee')
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
              <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                <Navigation className='w-5 h-5 text-orange-500' />
                {tUtilities('structureDirection')}
              </h3>
              <Controller
                name='direction'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <SelectDropdown
                      label={
                        <>
                          {tUtilities('houseDirection')}
                          <span className='text-destructive ml-1'>*</span>
                        </>
                      }
                      value={field.value || propertyInfo?.direction}
                      onValueChange={(value) => {
                        field.onChange(value)
                        updatePropertyInfo({
                          direction: value as Direction,
                        })
                        trigger('direction')
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
        <Card className='mb-6 shadow-lg border'>
          <CardHeader className='pb-4'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
              <CardTitle className='flex items-center gap-3 text-xl font-semibold text-foreground'>
                <div className='p-2 bg-primary/10 rounded-lg'>
                  <Bot className='w-6 h-6 text-primary' />
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
                  <label className='text-sm font-semibold text-foreground'>
                    {tAI('listingTitle')}
                    <span className='text-destructive ml-1'>*</span>
                  </label>
                  <Input
                    type='text'
                    value={titleInput}
                    maxLength={500}
                    placeholder={tPlaceholders('enterListingTitle')}
                    onChange={(e) => {
                      setTitleInput(e.target.value)
                      setTitleTouched(true)
                    }}
                    onBlur={() => setTitleTouched(true)}
                    aria-invalid={!!error}
                    className='h-12 px-4 border-2 border-border rounded-xl bg-background text-foreground focus:ring-1 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                  />
                  {error && (
                    <p className='text-xs text-destructive' role='alert'>
                      {error.message
                        ? tValidation(getValidationKey(error.message))
                        : ''}
                    </p>
                  )}
                  {!error && (
                    <div className='flex justify-between items-center'>
                      <p className='text-xs text-muted-foreground'>
                        {tAI('titleLength')}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          titleInput.length > 500
                            ? 'text-destructive'
                            : titleInput.length >= 30
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {titleInput.length}/500
                      </p>
                    </div>
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
                  <label className='text-sm font-semibold text-foreground'>
                    {tAI('propertyDescription')}
                    <span className='text-destructive ml-1'>*</span>
                  </label>
                  <Textarea
                    value={descriptionInput}
                    placeholder={tPlaceholders('enterPropertyDescription')}
                    onChange={(e) => {
                      setDescriptionInput(e.target.value)
                      setDescriptionTouched(true)
                    }}
                    onBlur={() => setDescriptionTouched(true)}
                    aria-invalid={!!error}
                    className='min-h-[128px] resize-none px-4 py-3 border-2 border-border rounded-xl bg-background text-foreground focus:ring-1 focus:border-ring focus:ring-ring/50 transition-all duration-200 shadow-sm hover:border-foreground/30'
                  />
                  {error && (
                    <p className='text-xs text-destructive' role='alert'>
                      {error.message
                        ? tValidation(getValidationKey(error.message))
                        : ''}
                    </p>
                  )}
                  {!error && (
                    <div className='flex justify-between items-center'>
                      <p className='text-xs text-muted-foreground'>
                        {tAI('descriptionHint')}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          descriptionInput.length >= 100
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {descriptionInput.length}{' '}
                        {descriptionInput.length >= 100
                          ? '✓'
                          : `(${tAI('minimum')} 100)`}
                      </p>
                    </div>
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
