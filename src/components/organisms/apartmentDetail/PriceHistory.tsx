import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { PriceHistoryPoint } from '@/types/apartmentDetail.types'
import { formatByLocale } from '@/utils/currency/convert'
import { formatDate } from '@/utils/date/formatters'

interface PriceHistoryProps {
  priceHistory: PriceHistoryPoint[]
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ priceHistory }) => {
  const t = useTranslations('apartmentDetail.priceHistory')

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
                {entry.date.includes('/') ? entry.date : formatDate(entry.date)}
              </Typography>
              <Typography
                variant='small'
                className='font-semibold text-foreground'
              >
                {formatByLocale(entry.price, 'vi-VN')}
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
