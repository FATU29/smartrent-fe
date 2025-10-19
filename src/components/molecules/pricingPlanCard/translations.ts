// Pricing plan card translation utilities
export const getPricingTranslations = (t: (key: string) => string) => ({
  bestSeller: t('pricing.bestSeller'),
  buyNow: t('pricing.buyNow'),
  saveUpTo: t('pricing.saveUpTo'),
})

export const getPricePeriodByLocale = (locale: string): string => {
  return locale?.startsWith('en') ? '/ month' : '/ tháng'
}

export const formatDiscountText = (
  discountPercent?: number,
): string | undefined => {
  if (typeof discountPercent !== 'number') return undefined
  return `(${discountPercent > 0 ? '-' : ''}${Math.abs(discountPercent)}%)`
}
