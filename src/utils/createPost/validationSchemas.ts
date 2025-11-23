import * as yup from 'yup'

// Note: Contact fields are handled outside of CreateListingRequest flow

// Shared property info validation fields aligned with CreateListingRequest
const getPropertyInfoFields = () => ({
  propertyType: yup
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
  // AI Content
  title: yup
    .string()
    .required('listingTitleRequired')
    .trim()
    .min(10, 'listingTitleMinLength')
    .max(100, 'listingTitleMaxLength'),
  description: yup
    .string()
    .required('propertyDescriptionRequired')
    .trim()
    .min(50, 'propertyDescriptionMinLength')
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
    assets: yup
      .object()
      .shape({
        images: yup
          .array()
          .of(yup.string().url('imageUrlInvalid'))
          .max(24, 'imagesTooMany')
          .required('imagesRequired'),
        // Accept both uploaded HTTP(S) URLs and temporary blob URLs during upload
        video: yup
          .string()
          .optional()
          .test('video-url', 'videoUrlInvalid', (val) => {
            if (!val) return true
            // Allow blob URLs or valid http/https URLs
            if (val.startsWith('blob:')) return true
            try {
              const u = new URL(val)
              return u.protocol === 'http:' || u.protocol === 'https:'
            } catch {
              return false
            }
          }),
      })
      .test('assets-required', 'imagesRequired', function (value) {
        // Rule: if a video exists, pass; otherwise require >= 4 images
        const hasVideo = !!value?.video && String(value.video).trim().length > 0
        const imageCount = Array.isArray(value?.images)
          ? value!.images!.length
          : 0
        return hasVideo || imageCount >= 4
      }),
  })
}

// Step 3: Package Config Validation Schema
export const getPackageConfigSchema = () => {
  return yup
    .object()
    .shape({
      // Simplified: we only require a start date (postDate) and either a packageSelection or benefitsMembership
      postDate: yup
        .string()
        .required('startDateRequired')
        .trim()
        .min(1, 'startDateRequired'),
      packageSelection: yup
        .object({
          tierId: yup.number().required(),
          priceId: yup.number().required(),
        })
        .optional(),
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
      // Require at least one selection: either VIP (packageSelection) or a membership benefit
      const hasVip = !!value?.packageSelection
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
      packageSelection: yup
        .object({
          tierId: yup.number().required(),
          priceId: yup.number().required(),
        })
        .optional(),
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
      const hasVip = !!value?.packageSelection
      const hasBenefit = Array.isArray(value?.benefitsMembership)
        ? value!.benefitsMembership!.length > 0
        : false
      return hasVip || hasBenefit
    })
}

// Field names for each step
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
  'furnishing',
  'bedrooms',
  'bathrooms',
  'direction',
] as const

export const STEP_2_FIELDS = [] as const

export const STEP_3_FIELDS = ['postDate'] as const
