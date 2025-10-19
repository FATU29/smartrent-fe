import { cn } from '@/lib/utils'

// Helper functions to reduce cognitive complexity

export const getCardStyles = (
  interactive: boolean,
  selected: boolean,
  isBestSeller: boolean,
  className?: string,
) => {
  return cn(
    'relative h-full transition-all duration-300',
    'bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/60',
    interactive &&
      'hover:-translate-y-1 hover:shadow-xl hover:border-primary/60 hover:bg-accent/40 focus-within:-translate-y-1 focus-within:shadow-xl focus-within:border-primary/60 active:translate-y-0',
    selected && 'ring-2 ring-primary shadow-lg',
    isBestSeller &&
      'border-primary/70 shadow-[0_0_0_1px_var(--tw-ring-color)] shadow-primary/10',
    isBestSeller &&
      'before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)]',
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

export const getButtonStyles = (interactive: boolean) => {
  return cn(
    'w-full transition-transform',
    interactive && 'hover:translate-y-[-2px] active:translate-y-0',
  )
}
