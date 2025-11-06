import React from 'react'
import { cn } from '@/lib/utils'
import { FileQuestion, SearchX, AlertCircle, Frown } from 'lucide-react'

interface NotFoundIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  variant?: 'fileQuestion' | 'searchX' | 'alertCircle' | 'frown'
}

export const NotFoundIcon = React.forwardRef<HTMLDivElement, NotFoundIconProps>(
  ({ className, size = 200, variant = 'fileQuestion', ...props }, ref) => {
    const iconSize = size * 0.6

    const icons = {
      fileQuestion: FileQuestion,
      searchX: SearchX,
      alertCircle: AlertCircle,
      frown: Frown,
    }

    const Icon = icons[variant]

    return (
      <div
        ref={ref}
        className={cn('relative flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        {/* Background circle */}
        <div
          className='absolute inset-0 rounded-full bg-muted/20'
          style={{ width: size, height: size }}
        />

        {/* Icon */}
        <Icon
          className='relative z-10 text-muted-foreground'
          size={iconSize}
          strokeWidth={1.5}
        />

        {/* Decorative elements */}
        <div className='absolute top-4 left-4 text-muted-foreground/40'>
          <FileQuestion size={size * 0.15} />
        </div>
        <div className='absolute bottom-4 right-4 text-muted-foreground/40'>
          <FileQuestion size={size * 0.15} />
        </div>
      </div>
    )
  },
)

NotFoundIcon.displayName = 'NotFoundIcon'
