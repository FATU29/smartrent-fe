import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import type { PaymentStatusType } from '@/components/atoms/paymentStatusBadge/index.constants'

interface StatusDescriptionProps {
  status: PaymentStatusType | string
  isPolling?: boolean
}

// Map of statuses to their i18n keys - moved outside component to avoid recreation
const STATUS_MAP: Record<string, string> = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  UNKNOWN: 'unknown',
}

/**
 * Helper component to display status description
 * Extracted to reduce duplication in PaymentStatusCard
 * Optimized with React.memo to prevent unnecessary re-renders during polling
 */
export const StatusDescription: React.FC<StatusDescriptionProps> = React.memo(
  ({ status, isPolling = false }) => {
    const t = useTranslations('paymentStatusPage')

    const normalizedStatus = useMemo(
      () => status?.toUpperCase(),
      [status],
    ) as string

    const stateKey = useMemo(
      () => STATUS_MAP[normalizedStatus] || 'unknown',
      [normalizedStatus],
    )

    // Show waiting message when polling - use stable message to avoid flickering
    const showWaitingMessage = useMemo(
      () => isPolling && normalizedStatus === 'PENDING',
      [isPolling, normalizedStatus],
    )

    const title = useMemo(
      () =>
        showWaitingMessage
          ? t('states.pending.waitingTitle')
          : t(`states.${stateKey}.title`),
      [showWaitingMessage, stateKey, t],
    )

    const description = useMemo(
      () =>
        showWaitingMessage
          ? t('states.pending.waitingDesc')
          : t(`states.${stateKey}.desc`),
      [showWaitingMessage, stateKey, t],
    )

    return (
      <div className='transition-all duration-300 ease-in-out'>
        <div className='font-medium text-sm sm:text-base transition-opacity duration-300 flex items-center gap-2'>
          {showWaitingMessage && (
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
          )}
          <span>{title}</span>
        </div>
        <div className='text-xs sm:text-sm text-muted-foreground transition-opacity duration-300'>
          {description}
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if status or polling state changes
    return (
      prevProps.status === nextProps.status &&
      prevProps.isPolling === nextProps.isPolling
    )
  },
)

StatusDescription.displayName = 'StatusDescription'
