import * as React from 'react'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { cn } from '@/lib/utils'

interface FormFieldProps extends React.ComponentProps<'input'> {
  label?: string
  error?: string
  required?: boolean
  description?: string
}

function FormField({
  label,
  error,
  required,
  description,
  className,
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className='space-y-2'>
      {label && (
        <Label
          htmlFor={fieldId}
          className={
            required
              ? 'after:content-["*"] after:ml-1 after:text-destructive'
              : ''
          }
        >
          {label}
        </Label>
      )}

      <Input
        id={fieldId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error
            ? `${fieldId}-error`
            : description
              ? `${fieldId}-description`
              : undefined
        }
        className={cn(
          'h-12',
          error && 'border-destructive focus-visible:border-destructive',
          className,
        )}
        {...props}
      />

      {description && !error && (
        <p
          id={`${fieldId}-description`}
          className='text-sm text-muted-foreground'
        >
          {description}
        </p>
      )}

      {error && (
        <p
          id={`${fieldId}-error`}
          className='text-sm text-destructive'
          role='alert'
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { FormField }
