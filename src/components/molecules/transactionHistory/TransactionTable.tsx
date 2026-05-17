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
const HEAD_CLASS = 'text-xs font-semibold uppercase tracking-wide'

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
      className='cursor-pointer'
      onClick={() => onSelect(item.transactionId)}
    >
      <TableCell>
        <Typography variant='small' className='font-semibold'>
          {typeLabel(item.paymentType)}
        </Typography>
        {item.invoice?.invoiceCode && (
          <Typography variant='caption' as='span' className='block'>
            {item.invoice.invoiceCode}
          </Typography>
        )}
      </TableCell>
      <TableCell className='text-right font-semibold tabular-nums whitespace-nowrap'>
        {formatAmount(item.amount)}
      </TableCell>
      <TableCell className='text-sm text-muted-foreground whitespace-nowrap'>
        {[item.paymentGateway, item.paymentMethod]
          .filter(Boolean)
          .join(' · ') || EMPTY}
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={item.status} />
      </TableCell>
      <TableCell className='max-w-[220px]'>
        <Typography variant='small' className='block truncate'>
          {room?.roomName || room?.roomCode || EMPTY}
        </Typography>
        {room?.address && (
          <Typography variant='caption' as='span' className='block truncate'>
            {room.address}
          </Typography>
        )}
      </TableCell>
      <TableCell className='text-sm'>
        <span className='block'>{landlord?.name || EMPTY}</span>
        {landlord?.phone && (
          <span className='block text-muted-foreground'>{landlord.phone}</span>
        )}
      </TableCell>
      <TableCell className='text-sm text-muted-foreground whitespace-nowrap'>
        {formatDateTime(item.createdAt)}
      </TableCell>
      <TableCell className='text-sm text-muted-foreground whitespace-nowrap'>
        {item.completedAt ? formatDateTime(item.completedAt) : EMPTY}
      </TableCell>
      <TableCell className='text-right'>
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
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent'>
            <TableHead className={HEAD_CLASS}>{t('transaction')}</TableHead>
            <TableHead className={`${HEAD_CLASS} text-right`}>
              {t('amount')}
            </TableHead>
            <TableHead className={HEAD_CLASS}>{t('method')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('status')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('room')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('landlord')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('created')}</TableHead>
            <TableHead className={HEAD_CLASS}>{t('completed')}</TableHead>
            <TableHead className={`${HEAD_CLASS} text-right`}>
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
