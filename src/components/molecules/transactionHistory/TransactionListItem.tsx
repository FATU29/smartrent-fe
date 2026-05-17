import React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import PaymentStatusBadge from '@/components/atoms/paymentStatusBadge'
import type { CustomerTransactionItem } from '@/api/types/customer-transaction.type'
import { useTransactionFormatters } from './helpers'

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
      className='gap-2 p-card-tight cursor-pointer transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <Typography variant='small' className='font-semibold truncate'>
            {item.transactionCode}
          </Typography>
          <Typography variant='caption' as='span' className='block'>
            {typeLabel(item.paymentType)}
          </Typography>
        </div>
        <PaymentStatusBadge status={item.status} />
      </div>

      <div className='flex items-end justify-between gap-3'>
        <Typography variant='large' className='text-foreground'>
          {formatAmount(item.amount)}
        </Typography>
        <ChevronRight
          className='size-4 shrink-0 text-muted-foreground'
          aria-hidden='true'
        />
      </div>

      <dl className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm text-muted-foreground'>
        {item.room?.roomName || item.room?.roomCode ? (
          <>
            <dt>{t('room')}</dt>
            <dd className='truncate text-foreground'>
              {item.room.roomName || item.room.roomCode}
            </dd>
          </>
        ) : null}
        {item.invoice?.invoiceCode ? (
          <>
            <dt>{t('transaction')}</dt>
            <dd className='truncate'>{item.invoice.invoiceCode}</dd>
          </>
        ) : null}
        <dt>{t('created')}</dt>
        <dd>{formatDateTime(item.createdAt)}</dd>
      </dl>
    </Card>
  )
}

export default TransactionListItem
