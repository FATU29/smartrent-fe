import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
import PaginationControls from '@/components/molecules/paginationControls'
import {
  TransactionFilters,
  TransactionHistoryContent,
  TransactionDetailDialog,
  ALL_VALUE,
} from '@/components/molecules/transactionHistory'
import { useCustomerTransactions } from '@/hooks/useCustomerTransactions'
import { useTransactionFilters } from './hooks/useTransactionFilters'

const PAGE_SIZE_OPTIONS = ['10', '20', '50']

const TransactionHistoryTemplate: React.FC = () => {
  const t = useTranslations('seller.transactions')
  const { filters, hasActiveFilters, patch, reset } = useTransactionFilters()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const { data, isLoading, isError, isFetching, refetch } =
    useCustomerTransactions({
      page: filters.page,
      size: filters.size,
      status: filters.status === ALL_VALUE ? undefined : filters.status,
      type: filters.type === ALL_VALUE ? undefined : filters.type,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      q: filters.q || undefined,
    })

  const items = data?.data ?? []

  const openDetail = (transactionId: string) => {
    setSelectedId(transactionId)
    setDetailOpen(true)
  }

  return (
    <div className='flex flex-1 flex-col gap-row-lg'>
      <header className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <Typography variant='pageTitle'>{t('title')}</Typography>
          <Typography variant='muted' as='p' className='mt-1'>
            {t('subtitle')}
          </Typography>
        </div>
        {data && data.totalElements > 0 && (
          <Badge variant='secondary' className='shrink-0 px-3 py-1'>
            {t('summary', { count: data.totalElements })}
          </Badge>
        )}
      </header>

      <TransactionFilters
        value={filters}
        onChange={patch}
        onReset={reset}
        hasActiveFilters={hasActiveFilters}
      />

      <TransactionHistoryContent
        items={items}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => refetch()}
        onSelect={openDetail}
      />

      {data && data.totalElements > 0 && (
        <div className='rounded-xl border bg-card p-card-tight shadow-xs'>
          <PaginationControls
            showPerPageSelector
            pagination={{
              currentPage: data.page,
              pageSize: data.size,
              totalItems: data.totalElements,
              totalPages: data.totalPages,
            }}
            currentSize={data.size}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(page) => patch({ page })}
            onSizeChange={(size) => patch({ size: Number(size) })}
          />
        </div>
      )}

      <TransactionDetailDialog
        transactionId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

export default TransactionHistoryTemplate
