import React from 'react'
import { cn } from '@/lib/utils'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'small' | 'muted' | 'lead'
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'p', as, className, ...props }, ref) => {
    const Component = as || getDefaultComponent(variant)

    return (
      <Component
        ref={ref}
        className={cn(getVariantClasses(variant), className)}
        {...props}
      />
    )
  },
)

Typography.displayName = 'Typography'

function getDefaultComponent(variant: TypographyProps['variant']) {
  switch (variant) {
    case 'h1':
      return 'h1'
    case 'h2':
      return 'h2'
    case 'h3':
      return 'h3'
    case 'h4':
      return 'h4'
    case 'small':
      return 'small'
    case 'lead':
    case 'p':
    case 'muted':
    default:
      return 'p'
  }
}

function getVariantClasses(variant: TypographyProps['variant']) {
  switch (variant) {
    case 'h1':
      return 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'
    case 'h2':
      return 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0'
    case 'h3':
      return 'scroll-m-20 text-2xl font-semibold tracking-tight'
    case 'h4':
      return 'scroll-m-20 text-xl font-semibold tracking-tight'
    case 'lead':
      return 'text-xl text-muted-foreground'
    case 'p':
      return 'leading-7 [&:not(:first-child)]:mt-6'
    case 'small':
      return 'text-sm font-medium leading-none'
    case 'muted':
      return 'text-sm text-muted-foreground'
    default:
      return ''
  }
}

export { Typography }
