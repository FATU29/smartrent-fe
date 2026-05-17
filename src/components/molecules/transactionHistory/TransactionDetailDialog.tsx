import React from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'
import PaymentStatusBadge from '@/components/atoms/paymentStatusBadge'
import { useCustomerTransactionDetail } from '@/hooks/useCustomerTransactions'
import type { CustomerTransactionDetail } from '@/api/types/customer-transaction.type'
import { useTransactionFormatters } from './helpers'

export interface TransactionDetailDialogProps {
  transactionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className='grid grid-cols-[7rem_1fr] gap-3 py-1.5 border-b last:border-0'>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='text-sm text-foreground break-words'>{value}</dd>
    </div>
  )
}

const DetailBody: React.FC<{ detail: CustomerTransactionDetail }> = ({
  detail,
}) => {
  const t = useTranslations('seller.transactions.detail')
  const { formatAmount, formatDateTime, typeLabel } = useTransactionFormatters()
  const timeline = detail.timeline ?? []

  return (
    <dl className='mt-2'>
      <Row label={t('transactionCode')} value={detail.transactionCode} />
      <Row
        label={t('status')}
        value={<PaymentStatusBadge status={detail.status} />}
      />
      <Row label={t('amount')} value={formatAmount(detail.amount)} />
      <Row label={t('paymentType')} value={typeLabel(detail.paymentType)} />
      <Row label={t('gateway')} value={detail.paymentGateway} />
      <Row label={t('gatewayCode')} value={detail.gatewayTransactionCode} />
      <Row label={t('paymentMethod')} value={detail.paymentMethod} />
      <Row label={t('created')} value={formatDateTime(detail.createdAt)} />
      <Row
        label={t('completed')}
        value={detail.completedAt ? formatDateTime(detail.completedAt) : null}
      />
      <Row
        label={t('invoice')}
        value={
          detail.invoice
            ? [detail.invoice.invoiceCode, detail.invoice.description]
                .filter(Boolean)
                .join(' — ')
            : null
        }
      />
      <Row
        label={t('room')}
        value={
          detail.room
            ? [
                detail.room.roomName || detail.room.roomCode,
                detail.room.address,
              ]
                .filter(Boolean)
                .join(' — ')
            : null
        }
      />
      <Row
        label={t('landlord')}
        value={
          detail.landlord
            ? [detail.landlord.name, detail.landlord.phone]
                .filter(Boolean)
                .join(' — ')
            : null
        }
      />
      <Row label={t('orderInfo')} value={detail.orderInfo} />
      {detail.failureReason && (
        <div className='grid grid-cols-[7rem_1fr] gap-3 py-1.5'>
          <dt className='text-sm text-muted-foreground'>
            {t('failureReason')}
          </dt>
          <dd className='text-sm text-destructive break-words'>
            {detail.failureReason}
          </dd>
        </div>
      )}

      <div className='mt-4'>
        <Typography variant='small' className='font-semibold'>
          {t('timeline')}
        </Typography>
        {timeline.length === 0 ? (
          <Typography variant='caption' as='p' className='mt-1'>
            {t('noTimeline')}
          </Typography>
        ) : (
          <ol className='mt-2 space-y-2 border-l pl-4'>
            {timeline.map((event, idx) => (
              <li
                key={`${event.status}-${event.at}-${idx}`}
                className='relative'
              >
                <span className='absolute -left-[1.30rem] top-1 size-2 rounded-full bg-primary' />
                <div className='flex flex-wrap items-center gap-2'>
                  <PaymentStatusBadge status={event.status} showIcon={false} />
                  <span className='text-xs text-muted-foreground'>
                    {formatDateTime(event.at)}
                  </span>
                </div>
                {event.note && (
                  <p className='text-sm text-muted-foreground'>{event.note}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </dl>
  )
}

const SKELETON_ROWS = 8

/** Loading placeholder that mirrors {@link DetailBody} so the dialog keeps a
 * stable, comfortably-sized layout instead of collapsing to a few thin bars. */
const DetailSkeleton: React.FC = () => (
  <div className='mt-2'>
    <dl>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <div
          key={i}
          className='grid grid-cols-[7rem_1fr] items-center gap-3 border-b py-2.5 last:border-0'
        >
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-full max-w-[220px]' />
        </div>
      ))}
    </dl>

    <div className='mt-5 space-y-3'>
      <Skeleton className='h-4 w-24' />
      <div className='space-y-3 border-l pl-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-5 w-24 rounded-full' />
              <Skeleton className='h-3 w-28' />
            </div>
            <Skeleton className='h-3 w-2/3' />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const TransactionDetailDialog: React.FC<
  TransactionDetailDialogProps
> = ({ transactionId, open, onOpenChange }) => {
  const t = useTranslations('seller.transactions')
  const { data, isLoading, isError, isFetching, refetch } =
    useCustomerTransactionDetail(transactionId ?? undefined, { enabled: open })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('detail.title')}</DialogTitle>
        </DialogHeader>

        {isLoading && <DetailSkeleton />}

        {!isLoading && isError && (
          <div className='py-6 text-center'>
            <Typography variant='body' as='p' className='text-muted-foreground'>
              {t('states.detailError')}
            </Typography>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-3 gap-1.5'
              onClick={() => refetch()}
            >
              <RefreshCw className='size-4' aria-hidden='true' />
              {t('actions.checkStatus')}
            </Button>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            <DetailBody detail={data} />
            <div className='mt-4 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1.5'
                disabled={isFetching}
                onClick={() => refetch()}
              >
                <RefreshCw
                  className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
                  aria-hidden='true'
                />
                {t('actions.checkStatus')}
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={() => onOpenChange(false)}
              >
                {t('actions.close')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TransactionDetailDialog
