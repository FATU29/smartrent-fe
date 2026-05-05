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

// Variant → design-system token mapping. Token values live in
// src/styles/globals.css (`@theme`) and are documented in DESIGN_SYSTEM.md.
// `text-base` (16px) and `text-sm` (14px) stay as Tailwind primitives per
// the doc — the named tokens carry typographic *role*, not every size.
function getVariantClasses(variant: TypographyProps['variant']) {
  switch (variant) {
    case 'h1':
      return 'text-display font-extrabold lg:text-display-xl'
    case 'h2':
      return 'text-title-lg font-semibold'
    case 'h3':
      return 'text-title font-semibold'
    case 'h4':
      return 'text-heading font-semibold'
    case 'h5':
      return 'text-subheading font-semibold'
    case 'h6':
      return 'text-base font-semibold'
    case 'blockquote':
      return 'mt-6 border-l-2 pl-6 italic'
    case 'list':
      return 'my-6 ml-6 list-disc [&>li]:mt-2'
    case 'inlineCode':
      return 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'
    case 'lead':
      return 'text-heading text-muted-foreground'
    case 'large':
      return 'text-subheading font-semibold'
    case 'p':
      return 'leading-7'
    case 'small':
      return 'text-sm font-medium leading-none'
    case 'muted':
      return 'text-sm text-muted-foreground'
    case 'body':
      // NOTE: text-md is broken in current build — tailwind.config.js is not
      // loaded by Tailwind v4 (no @config directive), so this class produces
      // no CSS rule and elements inherit size from parent. Migrating to
      // `text-body` would FIX this but break zero-diff. Tracking as a
      // separate follow-up to repair deliberately.
      return 'text-md leading-relaxed'
    case 'caption':
      // NOTE: text-2xs is broken in current build (see body note above).
      // Migrate to `text-micro` in the broken-legacy-class follow-up.
      return 'text-2xs text-muted-foreground'
    case 'overline':
      // NOTE: text-2xs is broken in current build (see body note above).
      return 'text-2xs font-semibold uppercase tracking-wider text-muted-foreground'
    case 'pageTitle':
      // Top-of-page H1. Responsive scale prevents 30px headings on a 360px phone.
      return 'text-title font-bold tracking-tight md:text-title-lg'
    case 'sectionTitle':
      // Major section heading within a page (e.g. dashboard sub-sections).
      return 'text-heading font-semibold tracking-tight sm:text-title'
    default:
      return ''
  }
}

export { Typography }
