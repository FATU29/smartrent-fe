import * as React from 'react'

import { cn } from '@/lib/utils'

// Single source of truth for page max-widths. Each width tier ships with a
// `2xl:` step so ultra-wide monitors get proportional breathing room instead
// of fixed dead-rails. Pick the variant by content shape, not by page name:
//
//   grid    — listings, dashboards, tables, comparison views
//   content — homepages, detail pages, marketing landings
//   form    — long-form forms (create/update post, account, membership)
//   prose   — single-column reading content (payment status, news article)
//   full    — explicit opt-out for pages that genuinely need full bleed
//             (mapView, embedded chat surfaces). Prefer one of the above.
//
// Numeric ladder:
//   grid    → 1280 → 1408 (max-w-7xl → 88rem)
//   content → 1152 → 1280 (max-w-6xl → max-w-7xl)
//   form    →  896 → 1024 (max-w-4xl → max-w-5xl)
//   prose   →  768 →  896 (max-w-3xl → max-w-4xl)
const WIDTHS = {
  grid: 'max-w-7xl 2xl:max-w-[88rem]',
  content: 'max-w-6xl 2xl:max-w-7xl',
  form: 'max-w-4xl 2xl:max-w-5xl',
  prose: 'max-w-3xl 2xl:max-w-4xl',
  full: '',
} as const

export type PageContainerWidth = keyof typeof WIDTHS

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width tier. Defaults to `content` (suits most marketing/detail pages). */
  width?: PageContainerWidth
  /**
   * Set false to skip the default responsive horizontal padding
   * (`px-4 sm:px-6 lg:px-8`). Vertical padding is never injected — pass
   * your own `py-N` via className so you stay in control of layout rhythm.
   */
  padded?: boolean
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  (
    { width = 'content', padded = true, className, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'mx-auto w-full',
        WIDTHS[width],
        padded && 'px-4 sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

PageContainer.displayName = 'PageContainer'

export { PageContainer }
