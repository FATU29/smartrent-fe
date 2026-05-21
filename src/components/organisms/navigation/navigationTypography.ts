// Shared typography tokens for all navigation text labels.
// NOTE: keep these as static string literals so Tailwind's JIT scanner picks
// them up — template-literal interpolation breaks class detection and lets
// upstream component bases (e.g. Button's text-sm) take over inconsistently.
export const NAVIGATION_TEXT_SIZE_PX = 14
export const NAVIGATION_TEXT_WEIGHT = 'font-medium'
export const NAVIGATION_TEXT_CLASSNAME =
  'text-sm font-medium leading-5 whitespace-nowrap'
