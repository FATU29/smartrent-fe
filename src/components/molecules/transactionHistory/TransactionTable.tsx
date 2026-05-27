import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table'
import { Typography } from '@/components/atoms/typography'
import PaymentStatusBadge from '@/components/atoms/paymentStatusBadge'
import type { CustomerTransactionItem } from '@/api/types/customer-transaction.type'
import { useTransactionFormatters } from './helpers'

const EMPTY = '—'
const HEAD_CLASS =
  'text-xs font-semibold uppercase tracking-wide whitespace-nowrap'

export interface TransactionTableProps {
  items: CustomerTransactionItem[]
  onSelect: (transactionId: string) => void
}

const TransactionRow: React.FC<{
  item: CustomerTransactionItem
  onSelect: (id: string) => void
}> = ({ item, onSelect }) => {
  const { formatAmount, formatDateTime, typeLabel } = useTransactionFormatters()
  const room = item.room
  const landlord = item.landlord

  return (
    <TableRow
      className='cursor-pointer'
      onClick={() => onSelect(item.transactionId)}
    >
      <TableCell className='min-w-[200px]'>
        <Typography variant='small' className='font-semibold'>
          {typeLabel(item.paymentType)}
        </Typography>
        {item.invoice?.invoiceCode && (
          <Typography variant='caption' as='span' className='block'>
            {item.invoice.invoiceCode}
          </Typography>
        )}
      </TableCell>
      <TableCell className='min-w-[140px] text-right font-semibold tabular-nums whitespace-nowrap'>
        {formatAmount(item.amount)}
      </TableCell>
      <TableCell className='min-w-[160px] text-sm text-muted-foreground whitespace-nowrap'>
        {[item.paymentGateway, item.paymentMethod]
          .filter(Boolean)
          .join(' · ') || EMPTY}
      </TableCell>
      <TableCell className='min-w-[130px]'>
        <PaymentStatusBadge status={item.status} />
      </TableCell>
      <TableCell className='min-w-[220px] max-w-[280px]'>
        <Typography variant='small' className='block truncate'>
          {room?.roomName || room?.roomCode || EMPTY}
        </Typography>
        {room?.address && (
          <Typography variant='caption' as='span' className='block truncate'>
            {room.address}
          </Typography>
        )}
      </TableCell>
      <TableCell className='min-w-[180px] max-w-[220px] text-sm'>
        <span className='block truncate'>{landlord?.name || EMPTY}</span>
        {landlord?.phone && (
          <span className='block truncate text-muted-foreground'>
            {landlord.phone}
          </span>
        )}
      </TableCell>
      <TableCell className='min-w-[160px] text-sm text-muted-foreground whitespace-nowrap'>
        {formatDateTime(item.createdAt)}
      </TableCell>
      <TableCell className='min-w-[160px] text-sm text-muted-foreground whitespace-nowrap'>
        {item.completedAt ? formatDateTime(item.completedAt) : EMPTY}
      </TableCell>
    </TableRow>
  )
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  items,
  onSelect,
}) => {
  const t = useTranslations('seller.transactions.columns')

  return (
    <div className='overflow-hidden rounded-xl border bg-card shadow-xs'>
      <Table aria-label={t('transaction')}>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent'>
            <TableHead className={`${HEAD_CLASS} min-w-[200px]`}>
              {t('transaction')}
            </TableHead>
            <TableHead className={`${HEAD_CLASS} min-w-[140px] text-right`}>
              {t('amount')}
            </TableHead>
            <TableHead className={`${HEAD_CLASS} min-w-[160px]`}>
              {t('method')}
            </TableHead>
            <TableHead className={`${HEAD_CLASS} min-w-[130px]`}>
              {t('status')}
            </TableHead>
            <TableHead className={`${HEAD_CLASS} min-w-[220px]`}>
              {t('room')}
            </TableHead>
            <TableHead className={`${HEAD_CLASS} min-w-[180px]`}>
              {t('landlord')}
            </TableHead>
            <TableHead className={`${HEAD_CLASS} min-w-[160px]`}>
              {t('created')}
            </TableHead>
            <TableHead className={`${HEAD_CLASS} min-w-[160px]`}>
              {t('completed')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TransactionRow
              key={item.transactionId}
              item={item}
              onSelect={onSelect}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TransactionTable
