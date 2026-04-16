import * as yup from 'yup'

type ValidationMode = 'strict' | 'draft'

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO'] as const
const PRICE_UNITS = ['MONTH', 'YEAR'] as const
const UTILITY_PRICE_TYPES = [
  'NEGOTIABLE',
  'SET_BY_OWNER',
  'PROVIDER_RATE',
] as const
const FURNISHING_TYPES = [
  'FULLY_FURNISHED',
  'SEMI_FURNISHED',
  'UNFURNISHED',
] as const
const DIRECTIONS = [
  'NORTH',
  'SOUTH',
  'EAST',
  'WEST',
  'NORTHEAST',
  'NORTHWEST',
  'SOUTHEAST',
  'SOUTHWEST',
] as const

const getAddressSchema = (mode: ValidationMode) => {
  const strictMode = mode === 'strict'

  return yup
    .object()
    .shape({
      latitude: strictMode
        ? yup
            .number()
            .required('addressRequired')
            .test(
              'is-valid-latitude',
              'locationRequired',
              (value) => value !== undefined && value !== 0,
            )
        : yup.number().optional(),
      longitude: strictMode
        ? yup
            .number()
            .required('addressRequired')
            .test(
              'is-valid-longitude',
              'locationRequired',
              (value) => value !== undefined && value !== 0,
            )
        : yup.number().optional(),
      legacy: yup.mixed().optional(),
      newAddress: yup.mixed().optional(),
    })
    .required('addressRequired')
    .test('address-complete', 'addressRequired', function (value: unknown) {
      const address = value as {
        latitude?: number
        longitude?: number
        newAddress?: { provinceCode?: string; wardCode?: string }
        legacy?: {
          provinceId?: number
          districtId?: number
          wardId?: number
        }
      }
      if (!address) return false

      const hasNewAddress =
        !!address.newAddress?.provinceCode && !!address.newAddress?.wardCode
      const hasLegacyAddress =
        !!address.legacy?.provinceId &&
        !!address.legacy?.districtId &&
        !!address.legacy?.wardId

      if (!(hasNewAddress || hasLegacyAddress)) {
        return this.createError({
          path: this.path,
          message: 'addressRequired',
        })
      }

      if (!strictMode) {
        return true
      }

      const hasValidCoords =
        address.latitude !== undefined &&
        address.longitude !== undefined &&
        address.latitude !== 0 &&
        address.longitude !== 0

      if (!hasValidCoords) {
        return this.createError({
          path: this.path,
          message: 'locationRequired',
        })
      }

      return true
    })
}

const getPropertyInfoFields = (mode: ValidationMode = 'strict') => {
  const strictMode = mode === 'strict'

  return {
    categoryId: yup.string().required('categoryTypeRequired'),
    productType: strictMode
      ? yup
          .string()
          .required('propertyTypeRequired')
          .oneOf(PROPERTY_TYPES, 'propertyTypeInvalid')
      : yup.string().optional().oneOf(PROPERTY_TYPES, 'propertyTypeInvalid'),
    address: getAddressSchema(mode),
    area: strictMode
      ? yup
          .number()
          .required('areaRequired')
          .positive('areaRequired')
          .min(0.1, 'areaRequired')
      : yup
          .number()
          .optional()
          .positive('areaRequired')
          .min(0.1, 'areaRequired'),
    price: strictMode
      ? yup
          .number()
          .required('priceRequired')
          .positive('priceRequired')
          .min(1, 'priceRequired')
      : yup
          .number()
          .optional()
          .positive('priceRequired')
          .min(1, 'priceRequired'),
    priceUnit: strictMode
      ? yup
          .string()
          .required('priceUnitRequired')
          .oneOf(PRICE_UNITS, 'priceUnitInvalid')
      : yup.string().optional().oneOf(PRICE_UNITS, 'priceUnitInvalid'),
    title: strictMode
      ? yup
          .string()
          .required('listingTitleRequired')
          .trim()
          .min(30, 'listingTitleMinLength')
          .max(500, 'listingTitleMaxLength')
      : yup
          .string()
          .required('listingTitleRequired')
          .trim()
          .max(500, 'listingTitleMaxLength'),
    description: strictMode
      ? yup
          .string()
          .required('propertyDescriptionRequired')
          .trim()
          .min(100, 'propertyDescriptionMinLength')
      : yup.string().optional().trim(),
    // Utilities & Structure
    waterPrice: strictMode
      ? yup
          .string()
          .required('waterPriceRequired')
          .oneOf(UTILITY_PRICE_TYPES, 'waterPriceInvalid')
      : yup.string().optional().oneOf(UTILITY_PRICE_TYPES, 'waterPriceInvalid'),
    electricityPrice: strictMode
      ? yup
          .string()
          .required('electricityPriceRequired')
          .oneOf(UTILITY_PRICE_TYPES, 'electricityPriceInvalid')
      : yup
          .string()
          .optional()
          .oneOf(UTILITY_PRICE_TYPES, 'electricityPriceInvalid'),
    internetPrice: strictMode
      ? yup
          .string()
          .required('internetPriceRequired')
          .oneOf(UTILITY_PRICE_TYPES, 'internetPriceInvalid')
      : yup
          .string()
          .optional()
          .oneOf(UTILITY_PRICE_TYPES, 'internetPriceInvalid'),
    serviceFee: strictMode
      ? yup
          .string()
          .required('serviceFeeRequired')
          .oneOf(UTILITY_PRICE_TYPES, 'serviceFeeInvalid')
      : yup.string().optional().oneOf(UTILITY_PRICE_TYPES, 'serviceFeeInvalid'),
    furnishing: strictMode
      ? yup
          .string()
          .required('interiorConditionRequired')
          .oneOf(FURNISHING_TYPES, 'interiorConditionRequired')
      : yup
          .string()
          .optional()
          .oneOf(FURNISHING_TYPES, 'interiorConditionRequired'),
    bedrooms: strictMode
      ? yup
          .number()
          .required('bedroomsRequired')
          .integer('bedroomsRequired')
          .min(1, 'bedroomsMinimum')
      : yup
          .number()
          .optional()
          .integer('bedroomsRequired')
          .min(1, 'bedroomsMinimum'),
    bathrooms: strictMode
      ? yup
          .number()
          .required('bathroomsRequired')
          .integer('bathroomsRequired')
          .min(1, 'bathroomsMinimum')
      : yup
          .number()
          .optional()
          .integer('bathroomsRequired')
          .min(1, 'bathroomsMinimum'),
    roomCapacity: strictMode
      ? yup
          .number()
          .required('roomCapacityRequired')
          .integer('roomCapacityRequired')
          .min(1, 'roomCapacityMinimum')
      : yup
          .number()
          .optional()
          .integer('roomCapacityRequired')
          .min(1, 'roomCapacityMinimum'),
    direction: strictMode
      ? yup
          .string()
          .required('directionRequired')
          .oneOf(DIRECTIONS, 'directionInvalid')
      : yup.string().optional().oneOf(DIRECTIONS, 'directionInvalid'),
  }
}

// Step 0: Property Info Validation Schema
export const getPropertyInfoSchema = (options?: { draftMode?: boolean }) => {
  const mode: ValidationMode = options?.draftMode ? 'draft' : 'strict'
  return yup.object().shape(getPropertyInfoFields(mode))
}

// Step 2: Media Validation Schema
export const getMediaSchema = () => {
  return yup.object().shape({
    images: yup
      .array()
      .of(yup.string().url('imageUrlInvalid'))
      .min(4, 'imagesMinimum')
      .max(24, 'imagesTooMany')
      .required('imagesRequired'),
    video: yup
      .string()
      .optional()
      .test('video-url', 'videoUrlInvalid', (val) => {
        if (!val) return true
        if (val.startsWith('blob:')) return true
        try {
          const u = new URL(val)
          return u.protocol === 'http:' || u.protocol === 'https:'
        } catch {
          return false
        }
      }),
  })
}

export const getPackageConfigSchema = () => {
  return yup
    .object()
    .shape({
      postDate: yup
        .string()
        .required('startDateRequired')
        .trim()
        .min(1, 'startDateRequired'),
      vipType: yup
        .string()
        .optional()
        .oneOf(['NORMAL', 'SILVER', 'GOLD', 'DIAMOND'], 'vipTypeInvalid'),
      durationDays: yup
        .number()
        .optional()
        .oneOf([10, 15, 30], 'durationInvalid'),
      benefitsMembership: yup
        .array()
        .of(
          yup.object({
            benefitId: yup.number().required(),
            membershipId: yup.number().required(),
          }),
        )
        .optional(),
    })
    .test('package-required', 'packageRequired', function (value) {
      const hasVip = !!value?.vipType && !!value?.durationDays
      const hasBenefit = Array.isArray(value?.benefitsMembership)
        ? value!.benefitsMembership!.length > 0
        : false
      return hasVip || hasBenefit
    })
}

// Combined schema for all steps
export const getCreatePostSchema = (options?: { draftMode?: boolean }) => {
  const mode: ValidationMode = options?.draftMode ? 'draft' : 'strict'

  return yup
    .object()
    .shape({
      // Step 0 - Property Info (reuse shared fields)
      ...getPropertyInfoFields(mode),
      // Step 3 - Package Config
      postDate: yup
        .string()
        .required('startDateRequired')
        .trim()
        .min(1, 'startDateRequired'),
      vipType: yup
        .string()
        .optional()
        .oneOf(['NORMAL', 'SILVER', 'GOLD', 'DIAMOND'], 'vipTypeInvalid'),
      durationDays: yup
        .number()
        .optional()
        .oneOf([10, 15, 30], 'durationInvalid'),
      benefitsMembership: yup
        .array()
        .of(
          yup.object({
            benefitId: yup.number().required(),
            membershipId: yup.number().required(),
          }),
        )
        .optional(),
    })
    .test('package-required', 'packageRequired', function (value) {
      const hasVip = !!value?.vipType && !!value?.durationDays
      const hasBenefit = Array.isArray(value?.benefitsMembership)
        ? value!.benefitsMembership!.length > 0
        : false
      return hasVip || hasBenefit
    })
}

export const STEP_0_FIELDS = [
  'categoryId',
  'productType',
  'address',
  'area',
  'price',
  'priceUnit',
  'furnishing',
  'bedrooms',
  'bathrooms',
  'roomCapacity',
  'waterPrice',
  'electricityPrice',
  'internetPrice',
  'serviceFee',
  'direction',
  'title',
  'description',
] as const

export const STEP_2_FIELDS = [] as const

export const STEP_3_FIELDS = ['postDate'] as const
