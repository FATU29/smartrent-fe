import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { formatDate } from '@/utils/date/formatters'
import { MapPin, Calendar, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Draft } from '@/types/draft.types'
import { DEFAULT_IMAGE } from '@/constants/common'

interface DraftCardProps {
  draft: Draft
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export const DraftCard: React.FC<DraftCardProps> = ({
  draft,
  onEdit,
  onDelete,
  className,
}) => {
  const t = useTranslations('seller.drafts.card')

  const draftTitle = draft.title || `${t('draftTitle')} - ${draft.id}`

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className='p-4'>
        <div className='flex gap-4'>
          {/* Image */}
          <div className='relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-muted'>
            {draft.images && draft.images.length > 0 ? (
              <Image
                src={draft.images[0]}
                alt={draftTitle}
                fill
                className='object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-muted'>
                <Image
                  src={DEFAULT_IMAGE}
                  alt='No image'
                  fill
                  className='object-cover opacity-50'
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0 flex flex-col gap-2'>
            {/* Title */}
            <Typography variant='h5' className='line-clamp-2'>
              {draftTitle}
            </Typography>

            {/* Address - only show if available */}
            {draft.address && (
              <div className='flex items-start gap-1.5'>
                <MapPin className='w-4 h-4 mt-0.5 shrink-0 text-muted-foreground' />
                <Typography
                  variant='small'
                  className='line-clamp-1 text-muted-foreground'
                >
                  {draft.address}
                </Typography>
              </div>
            )}

            {/* Property Info - only show available fields */}
            <div className='flex flex-wrap gap-2'>
              {draft.propertyType && (
                <Badge variant='outline' className='text-xs'>
                  {draft.propertyType}
                </Badge>
              )}
              {draft.price && (
                <Typography variant='small' className='font-medium'>
                  {new Intl.NumberFormat('vi-VN').format(draft.price)} đ
                </Typography>
              )}
              {draft.area && (
                <Typography variant='small' className='text-muted-foreground'>
                  {draft.area} m²
                </Typography>
              )}
              {draft.bedrooms !== undefined && (
                <Typography variant='small' className='text-muted-foreground'>
                  {draft.bedrooms} {t('bedrooms')}
                </Typography>
              )}
              {draft.bathrooms !== undefined && (
                <Typography variant='small' className='text-muted-foreground'>
                  {draft.bathrooms} {t('bathrooms')}
                </Typography>
              )}
            </div>

            {/* Created Date */}
            <div className='flex items-center gap-1.5 mt-auto'>
              <Calendar className='w-3.5 h-3.5 text-muted-foreground' />
              <Typography variant='small' className='text-muted-foreground'>
                {t('createdAt')}: {formatDate(draft.createdAt)}
              </Typography>
            </div>

            {/* Actions */}
            <div className='flex gap-2 mt-2'>
              {onEdit && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onEdit}
                  className='flex-1 sm:flex-initial'
                >
                  <Edit className='w-4 h-4 mr-1.5' />
                  {t('edit')}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onDelete}
                  className='text-destructive hover:text-destructive'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
