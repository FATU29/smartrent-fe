import { Property } from '@/api/types/property.type'

export const LISTING_CARD_STYLES = {
  container:
    'bg-background border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20',
  layout: 'flex flex-col sm:flex-row gap-3 sm:gap-4',

  // Image section
  imageContainer: 'relative w-full h-48 sm:w-32 sm:h-24 flex-shrink-0 group',
  image:
    'object-cover rounded-md transition-transform duration-200 group-hover:scale-105',
  packageBadgeContainer: 'absolute top-2 left-2 z-10',

  // Content sections
  contentContainer: 'flex-1 min-w-0',
  contentLayout: 'flex flex-col sm:flex-row sm:justify-between',
  leftContent: 'flex-1 sm:pr-4',
  rightContent: 'flex flex-col gap-3 mt-3 sm:mt-0',

  // Text elements
  title:
    'text-sm font-medium text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors cursor-pointer',
  address: 'text-xs text-muted-foreground mb-2',
  propertyInfo:
    'flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground mb-2',
  expiredMessage: 'text-xs text-destructive mb-2 font-medium',

  // Badge and status sections
  badgeContainer: 'flex items-center gap-2 mb-2',
  statusContainer: 'flex justify-start sm:justify-end',
  statsContainer: 'flex items-center gap-2 sm:gap-4',
} as const

export const LISTING_CARD_CONFIG = {
  defaultImage: '/images/default-image.jpg',
  imageAspectRatio: 'aspect-[4/3] sm:aspect-[4/3]',
  maxTitleLines: 2,
} as const

export interface ListingCardLogic {
  isExpired: boolean
  showRank: boolean
  showPromoteButton: boolean
  showRepostButton: boolean
  hasPackage: boolean
  hasVerification: boolean
  hasStats: boolean
}

export const getListingCardLogic = (property: Property): ListingCardLogic => ({
  isExpired: property.status === 'expired',
  showRank: property.status === 'active' && !!property.rank,
  showPromoteButton: property.status === 'active',
  showRepostButton: property.status === 'expired',
  hasPackage: !!property.package_type,
  hasVerification: !!property.verified,
  hasStats: !!property.stats,
})

export const LISTING_CARD_ANIMATIONS = {
  hover: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
  imageHover: 'group-hover:scale-105 transition-transform duration-300',
  fadeIn: 'animate-in fade-in-50 duration-200',
} as const
