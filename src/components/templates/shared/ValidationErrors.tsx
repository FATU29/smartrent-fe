import React from 'react'
import { Card } from '@/components/atoms/card'
import { useTranslations } from 'next-intl'

export interface ValidationError {
  key: string
  message: string
}

interface ValidationErrorsProps {
  errors: ValidationError[]
  currentStepTitle?: string
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  currentStepTitle,
}) => {
  const t = useTranslations('createPost')

  if (errors.length === 0) return null

  return (
    <Card className='w-full mx-auto md:max-w-6xl mt-4 border-0 shadow-none p-0'>
      <div className='bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0'>
            <svg
              className='w-5 h-5 text-red-500'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='flex-1'>
            <h3 className='text-sm font-semibold text-red-800 dark:text-red-300 mb-1'>
              {t('completeCurrentStep')}
            </h3>
            {currentStepTitle && (
              <p className='text-xs text-red-700 dark:text-red-400 mb-2'>
                {currentStepTitle}
              </p>
            )}
            <ul className='text-sm text-red-700 dark:text-red-400 space-y-1'>
              {errors.map((error) => (
                <li key={error.key} className='flex items-center gap-2'>
                  <span className='text-red-500'>•</span>
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
