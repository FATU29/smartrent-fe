import React from 'react'
import { NotFoundContent } from '@/components/molecules/not-found-content'
import { cn } from '@/lib/utils'

interface NotFoundTemplateProps {
  className?: string
  title?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  children?: React.ReactNode
}

export const NotFoundTemplate: React.FC<NotFoundTemplateProps> = ({
  className,
  title,
  description,
  showBackButton,
  showHomeButton,
  children,
}) => {
  return (
    <div
      className={cn(
        'min-h-screen w-full flex items-center justify-center',
        'bg-background px-4 py-8',
        className,
      )}
    >
      <div className='w-full max-w-2xl'>
        {children || (
          <NotFoundContent
            title={title}
            description={description}
            showBackButton={showBackButton}
            showHomeButton={showHomeButton}
          />
        )}
      </div>
    </div>
  )
}
