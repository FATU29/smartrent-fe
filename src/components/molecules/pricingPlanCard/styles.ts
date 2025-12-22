import { cn } from '@/lib/utils'

// Helper functions to reduce cognitive complexity

export const getCardStyles = (
  selected: boolean,
  isBestSeller: boolean,
  className?: string,
) => {
  return cn(
    'relative h-full w-full flex flex-col transition-shadow duration-300',
    'bg-background border-border',
    selected && 'ring-2 ring-primary shadow-lg',
    isBestSeller && 'border-primary shadow-md',
    className,
  )
}

export const getHeaderStyles = (compact: boolean, isBestSeller: boolean) => {
  return cn(
    'flex flex-col items-center text-center gap-3',
    compact ? 'pt-6 pb-4' : 'pt-8',
    isBestSeller && 'mt-2',
  )
}

export const getTitleStyles = (compact: boolean) => {
  return cn('font-semibold', compact ? 'text-base' : 'text-lg')
}

export const getDescriptionStyles = (compact: boolean) => {
  return cn('max-w-[240px]', compact ? 'text-[11px] leading-snug' : 'text-xs')
}

export const getPriceContainerStyles = (compact: boolean) => {
  return cn('flex flex-col items-center gap-1', compact ? 'mt-1' : 'mt-2')
}

export const getPriceStyles = (compact: boolean) => {
  return cn('font-semibold', compact ? 'text-xl tracking-tight' : 'text-2xl')
}

export const getPricePeriodStyles = (compact: boolean) => {
  return cn('text-muted-foreground', compact ? 'text-[11px]' : 'text-sm')
}

export const getDiscountStyles = (compact: boolean) => {
  return cn('text-destructive font-medium', compact ? 'text-[11px]' : 'text-sm')
}

export const getSavingStyles = (compact: boolean) => {
  return cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')
}

export const getContentStyles = (compact: boolean) => {
  return cn('flex flex-col', compact ? 'gap-4 mt-2 pb-2' : 'gap-6 mt-4')
}

export const getFeatureGroupTitleStyles = (compact: boolean) => {
  return cn('font-semibold tracking-tight', compact && 'text-[11px]')
}

export const getFeatureItemStyles = (compact: boolean) => {
  return cn('flex items-start gap-2', compact ? 'text-[11px]' : 'text-sm')
}

export const getButtonStyles = () => {
  return cn('w-full')
}
