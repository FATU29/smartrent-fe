import React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import PaymentStatusBadge from '@/components/atoms/paymentStatusBadge'
import type { CustomerTransactionItem } from '@/api/types/customer-transaction.type'
import { formatPaymentMethod, useTransactionFormatters } from './helpers'

export interface TransactionListItemProps {
  item: CustomerTransactionItem
  onSelect: (transactionId: string) => void
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  item,
  onSelect,
}) => {
  const t = useTranslations('seller.transactions.columns')
  const { formatAmount, formatDateTime, typeLabel } = useTransactionFormatters()

  const method = formatPaymentMethod(item.paymentGateway, item.paymentMethod)
  const roomLabel = item.room?.roomName || item.room?.roomCode

  return (
    <Card
      role='button'
      tabIndex={0}
      onClick={() => onSelect(item.transactionId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(item.transactionId)
        }
      }}
      className='gap-3 p-card-tight cursor-pointer transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.997]'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <Typography variant='small' className='font-semibold truncate'>
            {typeLabel(item.paymentType)}
          </Typography>
          {item.invoice?.invoiceCode && (
            <Typography
              variant='caption'
              as='span'
              className='block truncate text-muted-foreground'
            >
              {item.invoice.invoiceCode}
            </Typography>
          )}
        </div>
        <PaymentStatusBadge status={item.status} />
      </div>

      <div className='flex items-end justify-between gap-3 border-t border-dashed pt-2'>
        <div className='min-w-0'>
          <Typography
            variant='caption'
            as='span'
            className='block text-muted-foreground'
          >
            {t('amount')}
          </Typography>
          <Typography variant='large' className='tabular-nums text-foreground'>
            {formatAmount(item.amount)}
          </Typography>
        </div>
        <ChevronRight
          className='size-5 shrink-0 text-muted-foreground'
          aria-hidden='true'
        />
      </div>

      <dl className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm'>
        {roomLabel && (
          <>
            <dt className='text-muted-foreground'>{t('room')}</dt>
            <dd className='min-w-0 truncate text-foreground'>{roomLabel}</dd>
          </>
        )}
        {method && (
          <>
            <dt className='text-muted-foreground'>{t('method')}</dt>
            <dd className='min-w-0 truncate text-foreground'>{method}</dd>
          </>
        )}
        <dt className='text-muted-foreground'>{t('created')}</dt>
        <dd className='text-foreground'>{formatDateTime(item.createdAt)}</dd>
        {item.completedAt && (
          <>
            <dt className='text-muted-foreground'>{t('completed')}</dt>
            <dd className='text-foreground'>
              {formatDateTime(item.completedAt)}
            </dd>
          </>
        )}
      </dl>
    </Card>
  )
}

export default TransactionListItem
