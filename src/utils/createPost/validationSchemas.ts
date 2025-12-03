import * as yup from 'yup'

const getPropertyInfoFields = () => ({
  categoryId: yup.string().required('propertyTypeRequired'),
  productType: yup
    .string()
    .required('propertyTypeRequired')
    .oneOf(['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO'], 'propertyTypeInvalid'),
  address: yup
    .object()
    .shape({
      latitude: yup.number().required('addressRequired'),
      longitude: yup.number().required('addressRequired'),
      legacy: yup.mixed().optional(),
      new: yup.mixed().optional(),
    })
    .required('addressRequired'),
  area: yup
    .number()
    .required('areaRequired')
    .positive('areaRequired')
    .min(0.1, 'areaRequired'),
  price: yup
    .number()
    .required('priceRequired')
    .positive('priceRequired')
    .min(1, 'priceRequired'),
  priceUnit: yup
    .string()
    .required('priceUnitRequired')
    .oneOf(['MONTH', 'YEAR'], 'priceUnitInvalid'),
  title: yup
    .string()
    .required('listingTitleRequired')
    .trim()
    .min(30, 'listingTitleMinLength')
    .max(120, 'listingTitleMaxLength'),
  description: yup
    .string()
    .required('propertyDescriptionRequired')
    .trim()
    .min(70, 'propertyDescriptionMinLength')
    .max(2000, 'propertyDescriptionMaxLength'),
  // Utilities & Structure
  waterPrice: yup
    .string()
    .required('waterPriceRequired')
    .oneOf(['NEGOTIABLE', 'SET_BY_OWNER', 'PROVIDER_RATE']),
  electricityPrice: yup
    .string()
    .required('electricityPriceRequired')
    .oneOf(['NEGOTIABLE', 'SET_BY_OWNER', 'PROVIDER_RATE']),
  internetPrice: yup
    .string()
    .required('internetPriceRequired')
    .oneOf(['NEGOTIABLE', 'SET_BY_OWNER', 'PROVIDER_RATE']),
  serviceFee: yup
    .string()
    .required('serviceFeeRequired')
    .oneOf(['NEGOTIABLE', 'SET_BY_OWNER', 'PROVIDER_RATE']),
  furnishing: yup
    .string()
    .required('interiorConditionRequired')
    .oneOf(
      ['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'],
      'interiorConditionRequired',
    ),
  bedrooms: yup
    .number()
    .required('bedroomsRequired')
    .integer('bedroomsRequired')
    .min(1, 'bedroomsMinimum'),
  bathrooms: yup
    .number()
    .required('bathroomsRequired')
    .integer('bathroomsRequired')
    .min(1, 'bathroomsMinimum'),
  direction: yup
    .string()
    .required('directionRequired')
    .oneOf(
      [
        'NORTH',
        'SOUTH',
        'EAST',
        'WEST',
        'NORTHEAST',
        'NORTHWEST',
        'SOUTHEAST',
        'SOUTHWEST',
      ],
      'directionInvalid',
    ),
})

// Step 0: Property Info Validation Schema
export const getPropertyInfoSchema = () => {
  return yup.object().shape(getPropertyInfoFields())
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
export const getCreatePostSchema = () => {
  return yup
    .object()
    .shape({
      // Step 0 - Property Info (reuse shared fields)
      ...getPropertyInfoFields(),
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
  'propertyType',
  'address',
  'area',
  'price',
  'priceUnit',
  'title',
  'description',
  'waterPrice',
  'electricityPrice',
  'internetPrice',
  'serviceFee',
  'furnishing',
  'bedrooms',
  'bathrooms',
  'direction',
] as const

export const STEP_2_FIELDS = [] as const

export const STEP_3_FIELDS = ['postDate'] as const
