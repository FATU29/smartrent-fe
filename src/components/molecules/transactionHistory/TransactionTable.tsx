import React from 'react'
import { useTranslations } from 'next-intl'
import { Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import PaymentStatusBadge from '@/components/atoms/paymentStatusBadge'
import type { CustomerTransactionItem } from '@/api/types/customer-transaction.type'
import { useTransactionFormatters } from './helpers'

const EMPTY = '—'
const HEAD_CLASS =
  'text-xs font-semibold uppercase tracking-wide whitespace-nowrap'

// Sticky right column shared between header and body cells. Solid `bg-card`
// keeps the column opaque while rows beneath scroll horizontally; the soft
// left shadow signals the column is floating above the scrolled content.
const STICKY_ACTIONS =
  'sticky right-0 z-10 bg-card shadow-[-6px_0_10px_-8px_rgb(15_23_42_/_0.12)]'

export interface TransactionTableProps {
  items: CustomerTransactionItem[]
  onSelect: (transactionId: string) => void
}

const TransactionRow: React.FC<{
  item: CustomerTransactionItem
  onSelect: (id: string) => void
  viewLabel: string
}> = ({ item, onSelect, viewLabel }) => {
  const { formatAmount, formatDateTime, typeLabel } = useTransactionFormatters()
  const room = item.room
  const landlord = item.landlord

  return (
    <TableRow
      className='group cursor-pointer'
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
      <TableCell
        className={`${STICKY_ACTIONS} w-[140px] min-w-[140px] text-right group-hover:bg-muted/50`}
      >
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='gap-1.5'
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item.transactionId)
          }}
        >
          <Eye className='size-4' aria-hidden='true' />
          {viewLabel}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  items,
  onSelect,
}) => {
  const t = useTranslations('seller.transactions.columns')
  const tActions = useTranslations('seller.transactions.actions')

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
            <TableHead
              className={`${HEAD_CLASS} ${STICKY_ACTIONS} w-[140px] min-w-[140px] text-right`}
            >
              {t('actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TransactionRow
              key={item.transactionId}
              item={item}
              onSelect={onSelect}
              viewLabel={tActions('viewDetails')}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TransactionTable
