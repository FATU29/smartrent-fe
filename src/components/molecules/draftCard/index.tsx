import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { formatDate } from '@/utils/date/formatters'
import {
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Bed,
  Bath,
  Maximize2,
  DollarSign,
} from 'lucide-react'
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
  const hasImage = draft.images && draft.images.length > 0
  const imageUrl = hasImage ? draft.images![0] : DEFAULT_IMAGE

  return (
    <Card
      className={cn(
        'group hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden',
        className,
      )}
    >
      <CardContent className='p-0'>
        <div className='flex flex-col sm:flex-row'>
          {/* Image Section - Enhanced with default image */}
          <div className='relative w-full sm:w-56 h-56 sm:h-auto shrink-0 bg-gradient-to-br from-muted/50 to-muted'>
            <Image
              src={imageUrl}
              alt={draftTitle}
              fill
              className={cn(
                'object-cover transition-all duration-300',
                hasImage && 'group-hover:scale-105',
              )}
              unoptimized={!hasImage}
            />

            {/* Overlay gradient for better badge visibility */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20' />

            {/* Property Type Badge */}
            {draft.propertyType && (
              <div className='absolute top-3 left-3'>
                <Badge
                  variant='secondary'
                  className='backdrop-blur-md bg-background/90 border shadow-md font-medium'
                >
                  {draft.propertyType}
                </Badge>
              </div>
            )}

            {/* Draft Status Badge */}
            <div className='absolute top-3 right-3'>
              <Badge className='backdrop-blur-md bg-yellow-500 text-white border-yellow-600 shadow-md font-medium hover:bg-yellow-600'>
                {t('draft')}
              </Badge>
            </div>
          </div>

          {/* Content Section - Enhanced alignment */}
          <div className='flex-1 min-w-0 flex flex-col p-5 sm:p-6'>
            {/* Title & Description */}
            <div className='space-y-2 mb-4'>
              <Typography
                variant='h4'
                className='line-clamp-2 group-hover:text-primary transition-colors leading-tight'
              >
                {draftTitle}
              </Typography>

              {draft.description && (
                <Typography
                  variant='small'
                  className='line-clamp-2 text-muted-foreground leading-relaxed'
                >
                  {draft.description}
                </Typography>
              )}
            </div>

            {/* Address - Full text display with better styling */}
            {draft.address && (
              <div className='flex items-start gap-2.5 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10'>
                <MapPin className='w-5 h-5 mt-0.5 shrink-0 text-primary' />
                <Typography
                  variant='small'
                  className='text-foreground font-medium leading-relaxed'
                  title={draft.address}
                >
                  {draft.address}
                </Typography>
              </div>
            )}

            {/* Property Specs - Improved grid with better alignment */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {draft.price && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-primary/10 border border-primary/20 transition-all hover:bg-primary/15'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-primary/20'>
                    <DollarSign className='w-5 h-5 text-primary' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('price')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold text-primary truncate'
                    >
                      {new Intl.NumberFormat('vi-VN').format(draft.price)}đ
                    </Typography>
                  </div>
                </div>
              )}

              {draft.area && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 transition-all hover:bg-blue-100 dark:hover:bg-blue-950/50'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900'>
                    <Maximize2 className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('area')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold truncate text-blue-700 dark:text-blue-400'
                    >
                      {draft.area} m²
                    </Typography>
                  </div>
                </div>
              )}

              {draft.bedrooms !== undefined && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 transition-all hover:bg-purple-100 dark:hover:bg-purple-950/50'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900'>
                    <Bed className='w-5 h-5 text-purple-600 dark:text-purple-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('bedrooms')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold truncate text-purple-700 dark:text-purple-400'
                    >
                      {draft.bedrooms}
                    </Typography>
                  </div>
                </div>
              )}

              {draft.bathrooms !== undefined && (
                <div className='flex items-center gap-2.5 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900 transition-all hover:bg-cyan-100 dark:hover:bg-cyan-950/50'>
                  <div className='flex items-center justify-center w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900'>
                    <Bath className='w-5 h-5 text-cyan-600 dark:text-cyan-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='text-xs text-muted-foreground mb-0.5'
                    >
                      {t('bathrooms')}
                    </Typography>
                    <Typography
                      variant='small'
                      className='font-bold truncate text-cyan-700 dark:text-cyan-400'
                    >
                      {draft.bathrooms}
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Date and Actions - Better alignment */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto pt-4 border-t'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center justify-center w-7 h-7 rounded-full bg-muted'>
                  <Calendar className='w-3.5 h-3.5 text-muted-foreground' />
                </div>
                <Typography variant='small' className='text-muted-foreground'>
                  {formatDate(draft.createdAt)}
                </Typography>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                {onEdit && (
                  <Button
                    variant='default'
                    size='sm'
                    onClick={onEdit}
                    className='shadow-sm hover:shadow-md transition-all flex-1 sm:flex-initial'
                  >
                    <Edit className='w-4 h-4 mr-2' />
                    {t('edit')}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={onDelete}
                    className='text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all'
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
