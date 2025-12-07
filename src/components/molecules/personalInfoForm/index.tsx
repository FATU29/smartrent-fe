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
import { useAuth } from '@/hooks/useAuth'

type PersonalInfoFormData = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  idDocument: string
  taxNumber?: string
  avatar?: File
  address?: string
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
      .required(t('homePage.auth.validation.firstNameRequired'))
      .min(2, t('homePage.auth.validation.firstNameMinLength')),
    lastName: yup
      .string()
      .required(t('homePage.auth.validation.lastNameRequired'))
      .min(2, t('homePage.auth.validation.lastNameMinLength')),
    email: yup
      .string()
      .required(t('homePage.auth.validation.emailRequired'))
      .matches(
        VALIDATION_PATTERNS.EMAIL,
        t('homePage.auth.validation.emailInvalid'),
      ),
    phoneNumber: yup
      .string()
      .required(t('homePage.auth.validation.phoneNumberRequired'))
      .matches(/^[0-9+\-\s()]+$/, t('homePage.auth.validation.phoneInvalid')),
    idDocument: yup
      .string()
      .required(t('homePage.auth.validation.idDocumentRequired'))
      .min(9, t('homePage.auth.validation.idDocumentMinLength')),
    taxNumber: yup
      .string()
      .optional()
      .matches(/^[0-9\-]*$/, t('homePage.auth.validation.taxNumberInvalid')),
    avatar: yup.mixed().optional(),
  })

  const {
    control,
    handleSubmit,
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
      phoneNumber: initialData?.phoneNumber || '',
      idDocument: initialData?.idDocument || '',
      taxNumber: initialData?.taxNumber || '',
      address: initialData?.address || '',
    },
    mode: 'onChange',
  })

  // Controllers for simple FormField inputs
  const firstNameController = useController({ name: 'firstName', control })
  const lastNameController = useController({ name: 'lastName', control })
  const idDocumentController = useController({ name: 'idDocument', control })
  const taxNumberController = useController({ name: 'taxNumber', control })
  const addressController = useController({ name: 'address', control })

  const watchedValues = watch()
  const fullName = `${watchedValues.firstName} ${watchedValues.lastName}`.trim()

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
    // Sync to auth store first
    updateUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber as unknown as string,
    })
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
          {/* Avatar Upload */}
          <div className='flex justify-center'>
            <AvatarUpload
              name={fullName}
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

          {/* Contact Information */}
          <div className='space-y-4'>
            <Typography variant='h4' className='font-medium text-foreground'>
              {t('homePage.auth.accountManagement.personalInfo.contactInfo')}
            </Typography>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
              <PhoneField
                name='phoneNumber'
                control={control}
                label={t(
                  'homePage.auth.accountManagement.personalInfo.phoneNumber',
                )}
                placeholder={t('homePage.auth.common.phoneNumberPlaceholder')}
                error={errors.phoneNumber?.message}
              />
              <EmailField
                name='email'
                control={control}
                label={t('homePage.auth.accountManagement.personalInfo.email')}
                placeholder={t('homePage.auth.common.emailPlaceholder')}
                error={errors.email?.message}
              />
            </div>
          </div>

          {/* Business Information */}
          <div className='space-y-4'>
            <Typography variant='h4' className='font-medium text-foreground'>
              {t('homePage.auth.accountManagement.personalInfo.businessInfo')}
            </Typography>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
              <FormField
                label={t(
                  'homePage.auth.accountManagement.personalInfo.idDocument',
                )}
                placeholder={t('homePage.auth.register.idDocumentPlaceholder')}
                error={errors.idDocument?.message}
                {...idDocumentController.field}
              />
              <FormField
                label={t(
                  'homePage.auth.accountManagement.personalInfo.taxNumber',
                )}
                placeholder={t('homePage.auth.register.taxNumberPlaceholder')}
                error={errors.taxNumber?.message}
                {...taxNumberController.field}
              />
            </div>

            <FormField
              label={t('homePage.auth.accountManagement.personalInfo.address')}
              placeholder='Việt Nam'
              className='md:col-span-2'
              {...addressController.field}
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
