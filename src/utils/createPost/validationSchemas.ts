import * as yup from 'yup'
import { isYouTube } from '@/utils/video/url'
import { EMAIL_REGEX } from '@/constants/regex'

// Phone regex pattern (supports Vietnamese phone numbers with formatting)
// Limited to prevent ReDoS: max length check should be done separately
const PHONE_REGEX = /^[0-9+\-\s()]+$/

// Shared property info validation fields (used in both step 0 and combined schema)
const getPropertyInfoFields = () => ({
  propertyType: yup
    .string()
    .required('propertyTypeRequired')
    .oneOf(
      ['room', 'apartment', 'house', 'office', 'store'],
      'propertyTypeInvalid',
    ),
  propertyAddress: yup
    .string()
    .required('addressRequired')
    .trim()
    .min(1, 'addressRequired'),
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
  // AI Content
  listingTitle: yup
    .string()
    .required('listingTitleRequired')
    .trim()
    .min(1, 'listingTitleRequired'),
  propertyDescription: yup
    .string()
    .required('propertyDescriptionRequired')
    .trim()
    .min(1, 'propertyDescriptionRequired'),
  // Contact Information
  fullName: yup
    .string()
    .required('fullNameRequired')
    .trim()
    .min(1, 'fullNameRequired'),
  email: yup
    .string()
    .required('emailRequired')
    .matches(EMAIL_REGEX, 'emailInvalid')
    .max(254, 'emailInvalid'), // RFC 5321 limit to prevent ReDoS
  phoneNumber: yup
    .string()
    .required('phoneNumberRequired')
    .matches(PHONE_REGEX, 'phoneNumberInvalid')
    .max(20, 'phoneNumberInvalid'), // Reasonable limit to prevent ReDoS
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
  // Property Details
  interiorCondition: yup
    .string()
    .required('interiorConditionRequired')
    .oneOf(['furnished', 'semi-furnished', 'unfurnished']),
  bedrooms: yup
    .number()
    .required('bedroomsRequired')
    .integer('bedroomsRequired')
    .min(0, 'bedroomsRequired'),
  bathrooms: yup
    .number()
    .required('bathroomsRequired')
    .integer('bathroomsRequired')
    .min(0, 'bathroomsRequired'),
  moveInDate: yup
    .string()
    .required('moveInDateRequired')
    .trim()
    .min(1, 'moveInDateRequired'),
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
      .test('images-or-youtube', 'mediaImagesOrYoutube', function (images) {
        const videoUrl = this.parent.videoUrl
        const imageCount = images?.length || 0
        const isYT = typeof videoUrl === 'string' && isYouTube(videoUrl)
        // Accept if either at least 3 images or a YouTube link is provided
        return imageCount >= 3 || isYT
      }),
    videoUrl: yup.string().optional(),
  })
}

// Step 3: Package Config Validation Schema
export const getPackageConfigSchema = () => {
  return yup
    .object()
    .shape({
      selectedMembershipPlanId: yup.string().optional(),
      selectedVoucherPackageId: yup.string().optional(),
      selectedPackageType: yup.string().optional(),
      selectedDuration: yup
        .number()
        .required('durationRequired')
        .positive('durationRequired')
        .min(1, 'durationRequired'),
      packageStartDate: yup
        .string()
        .required('startDateRequired')
        .trim()
        .min(1, 'startDateRequired'),
    })
    .test('package-required', 'packageRequired', function (value) {
      // Require at least one package selection
      return !!(
        value?.selectedMembershipPlanId ||
        value?.selectedVoucherPackageId ||
        value?.selectedPackageType
      )
    })
}

// Combined schema for all steps
export const getCreatePostSchema = () => {
  return yup
    .object()
    .shape({
      // Step 0 - Property Info (reuse shared fields)
      ...getPropertyInfoFields(),
      // Step 2 - Media
      images: yup
        .array()
        .test('images-or-youtube', 'mediaImagesOrYoutube', function (images) {
          const videoUrl = this.parent.videoUrl
          const imageCount = images?.length || 0
          const isYT = typeof videoUrl === 'string' && isYouTube(videoUrl)
          return imageCount >= 3 || isYT
        }),
      videoUrl: yup.string().optional(),
      // Step 3 - Package Config
      selectedMembershipPlanId: yup.string().optional(),
      selectedVoucherPackageId: yup.string().optional(),
      selectedPackageType: yup.string().optional(),
      selectedDuration: yup
        .number()
        .required('durationRequired')
        .positive('durationRequired')
        .min(1, 'durationRequired'),
      packageStartDate: yup
        .string()
        .required('startDateRequired')
        .trim()
        .min(1, 'startDateRequired'),
    })
    .test('package-required', 'packageRequired', function (value) {
      return !!(
        value?.selectedMembershipPlanId ||
        value?.selectedVoucherPackageId ||
        value?.selectedPackageType
      )
    })
}

// Field names for each step
export const STEP_0_FIELDS = [
  'propertyType',
  'propertyAddress',
  'area',
  'price',
  'listingTitle',
  'propertyDescription',
  'fullName',
  'email',
  'phoneNumber',
  'waterPrice',
  'electricityPrice',
  'internetPrice',
  'interiorCondition',
  'bedrooms',
  'bathrooms',
  'moveInDate',
] as const

export const STEP_2_FIELDS = ['images', 'videoUrl'] as const

export const STEP_3_FIELDS = [
  'selectedMembershipPlanId',
  'selectedVoucherPackageId',
  'selectedPackageType',
  'selectedDuration',
  'packageStartDate',
] as const
