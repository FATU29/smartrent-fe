import * as React from 'react'
import { useForm, useController, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { EmailField } from '../emailField'
import { PhoneField } from '../phoneField'
import { FormField } from '../formField'
import { AvatarUpload } from '../avatarUpload'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VALIDATION_PATTERNS } from '@/api/types/auth.type'
import { VIETNAM_PHONE_REGEX } from '@/constants/regex'
import { useAuth } from '@/hooks/useAuth'

type PersonalInfoFormData = {
  firstName: string
  lastName: string
  email: string
  contactPhoneNumber: string
  idDocument: string
  avatar?: File
  avatarUrl?: string
  isBroker?: boolean | null
  brokerVerificationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | null
}

type PersonalInfoFormProps = {
  initialData?: Partial<PersonalInfoFormData>
  onSubmit?: (data: PersonalInfoFormData) => void
  loading?: boolean
  className?: string
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  className,
}) => {
  const t = useTranslations()
  const { updateUser } = useAuth()

  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .trim()
      .test(
        'requiredIfHadValue',
        t('homePage.auth.validation.firstNameRequired'),
        (value) => !initialData?.firstName?.trim() || Boolean(value),
      )
      .test(
        'notDefault',
        t('homePage.auth.validation.firstNameInvalid'),
        (value) => value !== '#32',
      ),
    lastName: yup
      .string()
      .trim()
      .test(
        'requiredIfHadValue',
        t('homePage.auth.validation.lastNameRequired'),
        (value) => !initialData?.lastName?.trim() || Boolean(value),
      )
      .test(
        'notDefault',
        t('homePage.auth.validation.lastNameInvalid'),
        (value) => value !== '#32',
      ),
    email: yup
      .string()
      .required(t('homePage.auth.validation.emailRequired'))
      .matches(
        VALIDATION_PATTERNS.EMAIL,
        t('homePage.auth.validation.emailInvalid'),
      ),
    contactPhoneNumber: yup
      .string()
      .trim()
      .matches(VIETNAM_PHONE_REGEX, {
        message: t('homePage.auth.validation.phoneInvalid'),
        excludeEmptyString: true,
      }),
    idDocument: yup
      .string()
      .trim()
      .optional()
      .test(
        'idDocumentMinLength',
        t('homePage.auth.validation.idDocumentMinLength'),
        (value) => !value || value.length >= 9,
      ),
    avatar: yup.mixed().optional(),
  })

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<PersonalInfoFormData>({
    resolver: yupResolver(
      validationSchema,
    ) as unknown as Resolver<PersonalInfoFormData>,
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      contactPhoneNumber: initialData?.contactPhoneNumber || '',
      idDocument: initialData?.idDocument || '',
      avatarUrl: initialData?.avatarUrl || '',
    },
    mode: 'onChange',
  })

  React.useEffect(() => {
    reset({
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      contactPhoneNumber: initialData?.contactPhoneNumber || '',
      idDocument: initialData?.idDocument || '',
      avatarUrl: initialData?.avatarUrl || '',
    })
  }, [initialData, reset])

  // Controllers for simple FormField inputs
  const firstNameController = useController({ name: 'firstName', control })
  const lastNameController = useController({ name: 'lastName', control })
  const idDocumentController = useController({ name: 'idDocument', control })

  const watchedValues = watch()
  const isProfessionalBroker =
    Boolean(initialData?.isBroker) ||
    initialData?.brokerVerificationStatus === 'APPROVED'

  // Realtime sync basic identity fields to auth store so dropdown updates immediately
  React.useEffect(() => {
    if (
      watchedValues.firstName ||
      watchedValues.lastName ||
      watchedValues.email
    ) {
      updateUser({
        firstName: watchedValues.firstName,
        lastName: watchedValues.lastName,
        email: watchedValues.email,
      })
    }
  }, [watchedValues.firstName, watchedValues.lastName, watchedValues.email])

  const handleAvatarChange = (file: File | null) => {
    setValue('avatar', file || undefined)
  }

  const handleFormSubmit = (data: PersonalInfoFormData) => {
    // Don't sync to auth store here - let the API response handle it
    // This ensures we only update after successful server update
    onSubmit?.(data)
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <User className='h-5 w-5 text-primary' />
          <Typography variant='h3' className='text-lg font-semibold'>
            {t('homePage.auth.accountManagement.personalInfo.title')}
          </Typography>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-5'>
          {/* Avatar Upload */}
          <div className='flex justify-center'>
            <AvatarUpload
              firstName={watchedValues.firstName}
              lastName={watchedValues.lastName}
              currentImage={initialData?.avatarUrl}
              isProfessionalBroker={isProfessionalBroker}
              onImageChange={handleAvatarChange}
              size='lg'
            />
          </div>

          {/* Name Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
            <FormField
              label={
                t(
                  'homePage.auth.accountManagement.personalInfo.firstName',
                ) /* Họ */
              }
              placeholder={t('homePage.auth.register.firstNamePlaceholder')}
              error={errors.firstName?.message}
              {...firstNameController.field}
            />
            <FormField
              label={
                t(
                  'homePage.auth.accountManagement.personalInfo.lastName',
                ) /* Tên */
              }
              placeholder={t('homePage.auth.register.lastNamePlaceholder')}
              error={errors.lastName?.message}
              {...lastNameController.field}
            />
          </div>

          {/* Contact Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
            <PhoneField
              name='contactPhoneNumber'
              control={control}
              label={t(
                'homePage.auth.accountManagement.personalInfo.phoneNumber',
              )}
              placeholder={t('homePage.auth.common.phoneNumberPlaceholder')}
              error={errors.contactPhoneNumber?.message}
            />
            <EmailField
              name='email'
              control={control}
              label={t('homePage.auth.accountManagement.personalInfo.email')}
              required
              disabled
              placeholder={t('homePage.auth.common.emailPlaceholder')}
              error={errors.email?.message}
            />
          </div>

          {/* Identification */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
            <FormField
              label={t(
                'homePage.auth.accountManagement.personalInfo.idDocument',
              )}
              placeholder={t('homePage.auth.register.idDocumentPlaceholder')}
              error={errors.idDocument?.message}
              {...idDocumentController.field}
            />
          </div>

          {/* Submit Button */}
          <div className='flex justify-end pt-4'>
            <Button
              type='submit'
              disabled={loading || (isDirty && !isValid)}
              className='min-w-[120px]'
            >
              {loading
                ? t('homePage.auth.accountManagement.personalInfo.saving')
                : t('homePage.auth.accountManagement.personalInfo.saveChanges')}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}

export { PersonalInfoForm }
