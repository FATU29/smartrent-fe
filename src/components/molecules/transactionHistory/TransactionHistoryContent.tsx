import React from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw, ReceiptText } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'
import type { CustomerTransactionItem } from '@/api/types/customer-transaction.type'
import { TransactionTable } from './TransactionTable'
import { TransactionListItem } from './TransactionListItem'

export interface TransactionHistoryContentProps {
  items: CustomerTransactionItem[]
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  hasActiveFilters: boolean
  onRetry: () => void
  onSelect: (transactionId: string) => void
}

const LoadingState: React.FC = () => (
  <div className='space-y-3'>
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className='h-16 w-full' />
    ))}
  </div>
)

const MessageState: React.FC<{
  icon: React.ReactNode
  message: string
  action?: React.ReactNode
}> = ({ icon, message, action }) => (
  <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card py-16 text-center'>
    <div className='text-muted-foreground'>{icon}</div>
    <Typography variant='body' as='p' className='text-muted-foreground'>
      {message}
    </Typography>
    {action}
  </div>
)

export const TransactionHistoryContent: React.FC<
  TransactionHistoryContentProps
> = ({
  items,
  isLoading,
  isError,
  isFetching,
  hasActiveFilters,
  onRetry,
  onSelect,
}) => {
  const t = useTranslations('seller.transactions')

  if (isLoading) return <LoadingState />

  if (isError) {
    return (
      <MessageState
        icon={<ReceiptText className='size-10' aria-hidden='true' />}
        message={t('states.loadError')}
        action={
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-1.5'
            onClick={onRetry}
          >
            <RefreshCw className='size-4' aria-hidden='true' />
            {t('actions.checkStatus')}
          </Button>
        }
      />
    )
  }

  if (items.length === 0) {
    return (
      <MessageState
        icon={<ReceiptText className='size-10' aria-hidden='true' />}
        message={hasActiveFilters ? t('empty.filtered') : t('empty.none')}
      />
    )
  }

  return (
    <div
      className={`transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}
      aria-busy={isFetching}
    >
      <div className='hidden md:block'>
        <TransactionTable items={items} onSelect={onSelect} />
      </div>
      <div className='flex flex-col gap-row md:hidden'>
        {items.map((item) => (
          <TransactionListItem
            key={item.transactionId}
            item={item}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default TransactionHistoryContent
