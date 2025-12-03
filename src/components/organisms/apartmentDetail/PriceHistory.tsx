import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { formatByLocale } from '@/utils/currency/convert'
import { formatDate } from '@/utils/date/formatters'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import type { PriceHistory } from '@/api/types'

interface PriceHistoryProps {
  priceHistory: PriceHistory[]
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ priceHistory }) => {
  const t = useTranslations('apartmentDetail.priceHistory')
  const { language: locale } = useSwitchLanguage()

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-semibold'>
          {t('simpleTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3.5'>
          {priceHistory.map((entry, index) => (
            <div
              key={index}
              className='flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0'
            >
              <Typography
                variant='small'
                className='text-muted-foreground font-medium'
              >
                {entry.changedAt.includes('/')
                  ? entry.changedAt
                  : formatDate(entry.changedAt)}
              </Typography>
              <Typography
                variant='small'
                className='font-semibold text-foreground'
              >
                {formatByLocale(entry.newPrice, locale)}
              </Typography>
            </div>
          ))}
        </div>

        {priceHistory.length === 0 && (
          <div className='text-center py-6'>
            <Typography variant='small' className='text-muted-foreground'>
              {t('noHistory')}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PriceHistory
