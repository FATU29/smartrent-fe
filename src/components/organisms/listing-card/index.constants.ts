export const LISTING_CARD_STYLES = {
  container:
    'group hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden bg-background border border-border rounded-lg',
  layout: 'flex flex-col sm:flex-row',

  // Image section - Square ratio for better layout
  imageContainer:
    'relative w-full sm:w-48 h-48 sm:h-48 shrink-0 bg-gradient-to-br from-muted/50 to-muted',
  image: 'object-cover transition-all duration-300 group-hover:scale-105',
  packageBadgeContainer: 'absolute top-3 left-3 z-10',

  // Content sections - Reduced padding for compact layout
  contentContainer: 'flex-1 min-w-0 flex flex-col p-4 sm:p-5',
  contentLayout: 'flex flex-col flex-1',
  leftContent: 'flex-1 space-y-3',
  rightContent: 'flex flex-col gap-4 mt-4 sm:mt-0',

  // Text elements - Enhanced typography
  title:
    'text-lg sm:text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight',
  address: 'text-sm text-muted-foreground mb-3',
  propertyInfo: 'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm',
  expiredMessage:
    'text-sm text-destructive font-semibold px-3 py-2 bg-destructive/10 rounded-lg border border-destructive/20',

  // Badge and status sections
  badgeContainer: 'flex items-center gap-2 flex-wrap mb-3',
  statusContainer: 'flex justify-start sm:justify-end',
  statsContainer: 'flex items-center gap-3',
} as const

export const LISTING_CARD_CONFIG = {
  defaultImage: '/images/default-image.jpg',
  imageAspectRatio: 'aspect-[4/3] sm:aspect-[4/3]',
  maxTitleLines: 2,
} as const

export const LISTING_CARD_ANIMATIONS = {
  hover: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
  imageHover: 'group-hover:scale-105 transition-transform duration-300',
  fadeIn: 'animate-in fade-in-50 duration-200',
} as const
