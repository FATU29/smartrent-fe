import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base appearance
          'flex min-h-[60px] w-full rounded-xl border-2 bg-white dark:bg-gray-800 px-4 py-3 text-base shadow-sm transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          // Default border colors
          'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
          // Selection colors
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
          // Focus state (single subtle ring)
          'focus:outline-none focus-visible:outline-none focus:ring-1 focus:border-blue-400 focus:ring-blue-400/50',
          // Error state via aria-invalid
          'aria-invalid:border-destructive aria-invalid:focus:ring-destructive/50 dark:aria-invalid:border-destructive',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
