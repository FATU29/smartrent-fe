import * as React from 'react'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import {
  EMAIL_PREFIX_REGEX,
  PHONE_PREFIX_REGEX,
  isValidEmailOrPhone,
} from '@/constants/regex'
import { useTranslations } from 'next-intl'
import { useController, Control } from 'react-hook-form'
import { Mail, Phone } from 'lucide-react'

interface EmailOrPhoneFieldProps {
  label?: string
  error?: string
  description?: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  showIcon?: boolean
  placeholder?: string
  className?: string
  id?: string
}

const EmailOrPhoneField = (props: EmailOrPhoneFieldProps) => {
  const {
    label,
    error,
    description,
    showIcon = true,
    className,
    id,
    name,
    control,
    placeholder,
  } = props

  const t = useTranslations()
  const fieldId = id || `emailorphone-field-${name}`

  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
    rules: {
      required: t('homePage.auth.validation.emailOrPhoneRequired'),
      validate: (value: string) => {
        if (!value) return true

        return (
          isValidEmailOrPhone(value) ||
          t('homePage.auth.validation.emailOrPhoneInvalid')
        )
      },
    },
  })

  const displayError = fieldError?.message || error

  // Determine icon based on input value
  const getIcon = () => {
    if (!showIcon) return null

    if (EMAIL_PREFIX_REGEX.test(field.value || '')) {
      return (
        <Mail
          className={cn(
            'h-4 w-4 text-muted-foreground',
            displayError && 'text-destructive',
          )}
        />
      )
    } else if (PHONE_PREFIX_REGEX.test(field.value || '')) {
      return (
        <Phone
          className={cn(
            'h-4 w-4 text-muted-foreground',
            displayError && 'text-destructive',
          )}
        />
      )
    } else {
      return (
        <Mail
          className={cn(
            'h-4 w-4 text-muted-foreground',
            displayError && 'text-destructive',
          )}
        />
      )
    }
  }

  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={fieldId}>{label}</Label>}

      <div className='relative'>
        {showIcon && (
          <div className='absolute left-3 top-1/2 -translate-y-1/2'>
            {getIcon()}
          </div>
        )}

        <Input
          {...field}
          id={fieldId}
          placeholder={
            placeholder || t('homePage.auth.common.emailOrPhonePlaceholder')
          }
          aria-invalid={displayError ? 'true' : 'false'}
          aria-describedby={
            displayError
              ? `${fieldId}-error`
              : description
                ? `${fieldId}-description`
                : undefined
          }
          className={cn(
            'h-12',
            showIcon && 'pl-10',
            displayError &&
              'border-destructive focus-visible:border-destructive',
            className,
          )}
        />
      </div>

      {description && !displayError && (
        <Typography variant='muted' id={`${fieldId}-description`}>
          {description}
        </Typography>
      )}

      {displayError && (
        <Typography
          variant='small'
          id={`${fieldId}-error`}
          className='text-destructive'
        >
          {displayError}
        </Typography>
      )}
    </div>
  )
}

export { EmailOrPhoneField }
