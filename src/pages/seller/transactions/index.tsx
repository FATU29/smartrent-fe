import React from 'react'
import { useTranslations } from 'next-intl'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import TransactionHistoryTemplate from '@/components/templates/transactionHistoryTemplate'

const TransactionsPage: NextPageWithLayout = () => {
  const t = useTranslations('seller.transactions')

  return (
    <>
      <SeoHead
        title={t('seoTitle')}
        description={t('seoDescription')}
        noindex
      />
      <TransactionHistoryTemplate />
    </>
  )
}

TransactionsPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default TransactionsPage
