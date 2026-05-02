// Single source of truth for media-query breakpoints.
//
// Numeric values mirror Tailwind's `screens` config in tailwind.config.js.
// The media-query strings use the Bootstrap pattern of `(N - 0.02)px` for
// `max-width` queries so they cleanly abut the corresponding `min-width:Npx`
// rule that Tailwind emits — avoiding the "both rules active at exactly Npx"
// flicker, *and* the half-pixel gap on retina displays that a plain
// `(max-width: (N-1)px)` query introduces.

export const SCREEN_SM = 640
export const SCREEN_MD = 768
export const SCREEN_LG = 1024
export const SCREEN_XL = 1280
export const SCREEN_2XL = 1536

// Below a breakpoint — pairs with Tailwind's `<bp>:hidden` / `<bp>:flex` etc.
//
//   <div className='block md:hidden'>      …mobile only…
//   const isMobile = useMediaQuery(MEDIA_BELOW_MD)
export const MEDIA_BELOW_SM = '(max-width: 639.98px)'
export const MEDIA_BELOW_MD = '(max-width: 767.98px)'
export const MEDIA_BELOW_LG = '(max-width: 1023.98px)'
export const MEDIA_BELOW_XL = '(max-width: 1279.98px)'
export const MEDIA_BELOW_2XL = '(max-width: 1535.98px)'

// At a breakpoint and above — pairs with Tailwind's mobile-first defaults.
//
//   <div className='hidden md:block'>      …desktop+ only…
//   const isDesktop = useMediaQuery(MEDIA_AT_MD)
export const MEDIA_AT_SM = '(min-width: 640px)'
export const MEDIA_AT_MD = '(min-width: 768px)'
export const MEDIA_AT_LG = '(min-width: 1024px)'
export const MEDIA_AT_XL = '(min-width: 1280px)'
export const MEDIA_AT_2XL = '(min-width: 1536px)'
