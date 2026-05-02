import React from 'react'
import { cn } from '@/lib/utils'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'blockquote'
    | 'list'
    | 'inlineCode'
    | 'lead'
    | 'large'
    | 'small'
    | 'muted'
    | 'body'
    | 'caption'
    | 'overline'
    | 'pageTitle'
    | 'sectionTitle'
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
    case 'h5':
      return 'h5'
    case 'h6':
      return 'h6'
    case 'blockquote':
      return 'blockquote'
    case 'list':
      return 'ul'
    case 'inlineCode':
      return 'code'
    case 'caption':
    case 'overline':
      return 'span'
    case 'pageTitle':
      return 'h1'
    case 'sectionTitle':
      return 'h2'
    case 'lead':
    case 'large':
    case 'small':
    case 'muted':
    case 'body':
    case 'p':
    default:
      return 'p'
  }
}

function getVariantClasses(variant: TypographyProps['variant']) {
  switch (variant) {
    case 'h1':
      return 'text-4xl font-extrabold lg:text-5xl'
    case 'h2':
      return 'text-3xl font-semibold'
    case 'h3':
      return 'text-2xl font-semibold'
    case 'h4':
      return 'text-xl font-semibold'
    case 'h5':
      return 'text-lg font-semibold'
    case 'h6':
      return 'text-base font-semibold'
    case 'blockquote':
      return 'mt-6 border-l-2 pl-6 italic'
    case 'list':
      return 'my-6 ml-6 list-disc [&>li]:mt-2'
    case 'inlineCode':
      return 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'
    case 'lead':
      return 'text-xl text-muted-foreground'
    case 'large':
      return 'text-lg font-semibold'
    case 'p':
      return 'leading-7'
    case 'small':
      return 'text-sm font-medium leading-none'
    case 'muted':
      return 'text-sm text-muted-foreground'
    case 'body':
      // 15px reading body — sits between text-sm (14) and text-base (16),
      // intended for marketing/dashboard prose where text-sm feels cramped.
      return 'text-md leading-relaxed'
    case 'caption':
      // 11px micro text for chips, badges, meta lines, kbd hints.
      return 'text-2xs text-muted-foreground'
    case 'overline':
      // 11px uppercase tracking labels (the "ELECTRICITY", "PHONE" overline
      // pattern that's repeated ~12 times across the codebase).
      return 'text-2xs font-semibold uppercase tracking-wider text-muted-foreground'
    case 'pageTitle':
      // Top-of-page H1. Responsive scale prevents 30px headings on a 360px phone.
      return 'text-2xl font-bold tracking-tight md:text-3xl'
    case 'sectionTitle':
      // Major section heading within a page (e.g. dashboard sub-sections).
      return 'text-xl font-semibold tracking-tight sm:text-2xl'
    default:
      return ''
  }
}

export { Typography }
