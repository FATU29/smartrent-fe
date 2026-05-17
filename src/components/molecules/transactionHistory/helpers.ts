import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { CUSTOMER_TRANSACTION_TYPES } from '@/api/types/customer-transaction.type'
import { useLanguage } from '@/hooks/useLanguage'
import { formatByLocale } from '@/utils/currency/convert'
import { formatDateTimeWithLocale } from '@/utils/date/formatters'

const KNOWN_TYPES = new Set<string>(CUSTOMER_TRANSACTION_TYPES)

/**
 * Title-case an unknown enum-ish value (e.g. `NEW_FEE_TYPE` -> `New Fee Type`)
 * so the UI never crashes or shows a raw SCREAMING_CASE token.
 */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Returns a translator for payment-type codes. Known backend enum values use
 * localized labels; anything unknown falls back to a safe title-cased label.
 */
export function usePaymentTypeLabel(): (type?: string | null) => string {
  const t = useTranslations('seller.transactions.types')
  return useCallback(
    (type?: string | null) => {
      if (!type) return ''
      return KNOWN_TYPES.has(type) ? t(type) : titleCase(type)
    },
    [t],
  )
}

/**
 * Locale-aware amount / date-time formatters plus the payment-type label,
 * bundled so list, table and detail views format identically.
 */
export function useTransactionFormatters() {
  const { language } = useLanguage()
  const typeLabel = usePaymentTypeLabel()
  const dateLocale = language === 'en' ? 'en-US' : 'vi-VN'

  return {
    formatAmount: (amount: number) => formatByLocale(amount, language),
    formatDateTime: (value?: string | null) =>
      formatDateTimeWithLocale(value ?? undefined, dateLocale),
    typeLabel,
  }
}
