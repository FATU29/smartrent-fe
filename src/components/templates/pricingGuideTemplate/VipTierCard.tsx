import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
import type { VipTier } from '@/api/types/vip-tier.type'

interface VipTierCardProps {
  tier: VipTier
  nameKey: string
  descriptionKey: string
  priorityKey: string
  titleClassName?: string
  priceClassName?: string
  badgeVariant?: 'default' | 'secondary' | 'outline'
  badgeClassName?: string
  formatPrice: (price: number) => string
}

const VipTierCard: React.FC<VipTierCardProps> = ({
  tier,
  nameKey,
  descriptionKey,
  priorityKey,
  titleClassName = '',
  priceClassName = '',
  badgeVariant = 'default',
  badgeClassName = '',
  formatPrice,
}) => {
  const t = useTranslations('guides.pricing')

  const getDuration = () => {
    if (tier.price30Days) return '30'
    if (tier.price15Days) return '15'
    return '10'
  }

  const getPrice = () => {
    return tier.price30Days || tier.price15Days || tier.price10Days || 0
  }

  return (
    <div className='p-4 border rounded-lg'>
      <div className='flex items-start justify-between mb-2'>
        <Typography variant='h4' className={titleClassName}>
          {t(nameKey)}
        </Typography>
        <Badge variant={badgeVariant} className={badgeClassName}>
          {t(priorityKey)}
        </Badge>
      </div>
      <Typography variant='p' className='mb-3 text-muted-foreground'>
        {tier.description || t(descriptionKey)}
      </Typography>
      <div className='grid grid-cols-2 gap-2 text-sm'>
        <div>
          <span className='text-muted-foreground'>
            {t('postTypes.duration')}:
          </span>{' '}
          <strong>{getDuration()} ngày</strong>
        </div>
        <div>
          <span className='text-muted-foreground'>{t('postTypes.price')}:</span>{' '}
          <strong className={priceClassName}>
            {formatPrice(getPrice())} đ
          </strong>
        </div>
      </div>
    </div>
  )
}

export default VipTierCard
