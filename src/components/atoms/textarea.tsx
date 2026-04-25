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
          'flex min-h-[60px] w-full rounded-xl border-2 bg-background text-foreground px-4 py-3 text-base shadow-sm transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          // Default border colors
          'border-border hover:border-foreground/30',
          // Selection colors
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
          // Focus state (single subtle ring)
          'focus:outline-none focus-visible:outline-none focus:ring-1 focus:border-ring focus:ring-ring/50',
          // Error state via aria-invalid
          'aria-invalid:border-destructive aria-invalid:focus:ring-destructive/50',
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
