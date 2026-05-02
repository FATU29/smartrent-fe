'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import { PageContainer } from '@/components/atoms/pageContainer'
import { Typography } from '@/components/atoms/typography'
import CompareTable from '@/components/organisms/compareTable'
import EmptyCompareState from '@/components/organisms/emptyCompareState'
import { useCompareStore } from '@/store/compare/useCompareStore'

/**
 * CompareTemplate
 * Clean template component for compare page
 * Handles state and layout
 */
const CompareTemplate: React.FC = () => {
  const t = useTranslations('compare')
  const { compareList, clearCompare } = useCompareStore()
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration: Wait for Zustand store to hydrate from localStorage
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <PageContainer width='grid' className='py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-muted rounded w-48 mb-4' />
          <div className='h-64 bg-muted rounded' />
        </div>
      </PageContainer>
    )
  }

  const hasItems = compareList.length > 0

  return (
    <PageContainer width='grid' className='py-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div>
          <Typography variant='pageTitle' className='mb-2'>
            {t('title')}
          </Typography>
          <p className='text-muted-foreground'>{t('subtitle')}</p>
        </div>

        {hasItems && (
          <Button
            variant='outline'
            onClick={clearCompare}
            className='gap-2 shrink-0'
          >
            <Trash2 className='w-4 h-4' />
            {t('actions.clearAll')}
          </Button>
        )}
      </div>

      {/* Content */}
      {hasItems ? (
        <CompareTable listings={compareList} />
      ) : (
        <EmptyCompareState />
      )}
    </PageContainer>
  )
}

export default CompareTemplate
