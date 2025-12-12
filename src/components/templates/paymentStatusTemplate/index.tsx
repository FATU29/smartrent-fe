import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/atoms/button'
import { PaymentStatusCard } from '@/components/molecules/paymentStatusCard'
import type { PaymentStatusType } from '@/components/atoms/paymentStatusBadge/index.constants'
import { PUBLIC_ROUTES } from '@/constants/route'

export interface PaymentStatusTemplateProps {
  transactionRef?: string
  status: PaymentStatusType | string
  isLoading?: boolean
  isFetching?: boolean
  error?: Error | null
  isTerminal?: boolean
  onRetry?: () => void
  productInfo?: React.ReactNode
}

export const PaymentStatusTemplate: React.FC<PaymentStatusTemplateProps> = ({
  transactionRef,
  status,
  isLoading = false,
  isFetching = false,
  error,
  isTerminal = false,
  onRetry,
  productInfo,
}) => {
  const t = useTranslations('paymentStatusPage')

  return (
    <div className='mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-xl sm:text-2xl font-semibold'>{t('title')}</h1>
          <p className='text-sm sm:text-base text-muted-foreground'>
            {t('subtitle')}
          </p>
        </div>

        {/* Content */}
        {!transactionRef ? (
          <div className='rounded-xl border bg-card p-6 space-y-4'>
            <p className='text-destructive text-sm sm:text-base'>
              {t('errors.missingRef')}
            </p>
            <Button asChild variant='outline' size='sm'>
              <Link href={PUBLIC_ROUTES.HOME}>{t('actions.backHome')}</Link>
            </Button>
          </div>
        ) : error ? (
          <div className='rounded-xl border bg-card p-6 space-y-4'>
            <p className='text-destructive text-sm sm:text-base'>
              {t('errors.loadFailed')}
            </p>
            <div className='text-xs sm:text-sm text-muted-foreground'>
              {error instanceof Error ? error.message : String(error)}
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={onRetry}
                disabled={isLoading}
              >
                {t('actions.retry')}
              </Button>
              <Button asChild variant='ghost' size='sm'>
                <Link href={PUBLIC_ROUTES.HOME}>{t('actions.backHome')}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <PaymentStatusCard
              transactionRef={transactionRef}
              status={status}
              isLoading={isLoading}
              isFetching={isFetching}
              productInfo={productInfo}
            />

            {/* Actions */}
            <div className='flex flex-wrap gap-2 sm:gap-3 px-1'>
              <Button asChild variant='outline' size='default'>
                <Link href={PUBLIC_ROUTES.HOME}>{t('actions.backHome')}</Link>
              </Button>
              {!isTerminal && (
                <Button
                  variant='ghost'
                  size='default'
                  onClick={onRetry}
                  disabled={isLoading || isFetching}
                >
                  {t('actions.refresh')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentStatusTemplate
