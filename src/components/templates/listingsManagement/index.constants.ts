import { ListingsCounts } from './index.types'

export const PLACEHOLDER_COUNTS: ListingsCounts = {
  all: 0,
  expired: 0,
  expiring: 0,
  active: 0,
  pending: 0,
  review: 0,
  payment: 0,
  rejected: 0,
  archived: 0,
}

export const DIALOG_CONFIG = {
  // Desktop: max-w-xl, Mobile: full screen
  maxWidth: 'max-w-xl sm:max-w-xl w-full sm:w-auto',
  // Desktop: fixed height, Mobile: full height
  height: 'h-full sm:h-[650px]',
  // Desktop: rounded, Mobile: no border radius for fullscreen
  borderRadius: 'rounded-none sm:rounded-3xl',
  // Responsive padding
  padding: 'p-4 sm:p-6',
  // Content area
  minContentHeight: 'min-h-[300px]',
  maxContainerWidth: 'max-w-7xl',
  // Mobile fullscreen positioning
  positioning: 'fixed inset-0 sm:relative sm:inset-auto',
}
