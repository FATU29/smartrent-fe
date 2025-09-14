import * as React from 'react'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { cn } from '@/lib/utils'
import { useController, Control } from 'react-hook-form'

interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  description?: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  placeholder?: string
  className?: string
  id?: string
}

function FormField({
  function FormField({
    label,
    error,
    required,
    description,
    name,
    control,
    placeholder,
    className,
    id,
  }: FormFieldProps) {
    const fieldId = id || `form-field-${name}`

    const {
      field,
      fieldState: { error: fieldError },
    } = useController({
      name,
      control,
    })

    const displayError = fieldError?.message || error
    return (
      <div className='space-y-2'>
        {label && (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )}
        <Input
          {...field}
          id={fieldId}
          placeholder={placeholder}
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
            displayError && 'border-destructive focus-visible:border-destructive',
            className,
          )}
        />
        {description && !displayError && (
          <p
            id={`${fieldId}-description`}
            className='text-sm text-muted-foreground'
          >
            {description}
          </p>
        )}
        {displayError && (
          <p
            id={`${fieldId}-error`}
            className='text-sm text-destructive'
            role='alert'
          >
            {displayError}
          </p>
        )}
      </div>
    )
  }
id = {`${fieldId}-error`}
className = 'text-sm text-destructive'
role = 'alert'
  >
  { error }
        </p >
      )}
    </div >
  )
}

export { FormField }
