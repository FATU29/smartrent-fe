import * as React from 'react'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { VIETNAM_PHONE_REGEX } from '@/constants/regex'
import { useTranslations } from 'next-intl'
import { useController, Control } from 'react-hook-form'
import { Phone } from 'lucide-react'

interface PhoneFieldProps {
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

const PhoneField = (props: PhoneFieldProps) => {
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
  const fieldId = id || `phone-field-${name}`

  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
    rules: {
      required: t('homePage.auth.validation.phoneNumberRequired'),
      pattern: {
        value: VIETNAM_PHONE_REGEX,
        message: t('homePage.auth.validation.phoneNumberInvalid'),
      },
    },
  })
  const displayError = fieldError?.message || error

  return (
    <div className='space-y-2'>
      {label && <Label htmlFor={fieldId}>{label}</Label>}

      <div className='relative'>
        {showIcon && (
          <div className='absolute left-3 top-1/2 -translate-y-1/2'>
            <Phone
              className={cn(
                'h-4 w-4 text-muted-foreground',
                displayError && 'text-destructive',
              )}
            />
          </div>
        )}

        <Input
          {...field}
          id={fieldId}
          placeholder={
            placeholder || t('homePage.auth.common.phoneNumberPlaceholder')
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

export { PhoneField }
