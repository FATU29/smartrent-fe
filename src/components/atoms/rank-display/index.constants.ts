export const RANK_DISPLAY_STYLES = {
  container: 'inline-flex items-center gap-1 text-xs',
  pageLabel:
    'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded font-medium',
  positionLabel: 'text-muted-foreground',
  progressContainer: 'flex gap-1 ml-1',
  progressDot: 'w-2 h-1 rounded-full',
  progressDotActive: 'bg-orange-400 dark:bg-orange-500',
  progressDotInactive: 'bg-gray-200 dark:bg-gray-700',
} as const

export const RANK_DISPLAY_TRANSLATIONS = {
  page: 'components.rankDisplay.page',
  position: 'components.rankDisplay.position',
} as const
