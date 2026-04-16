import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Separator } from '@/components/atoms/separator'
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
  ImageOff,
  Sparkles,
  CircleAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Draft } from '@/types/draft.types'
import { DEFAULT_IMAGE } from '@/constants/common'
import { Progress } from '@/components/atoms/progress'

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

  const draftTitle =
    draft.title?.trim() || t('defaultTitle', { id: String(draft.id) })
  const draftDescription = draft.description?.trim() || t('defaultDescription')
  const address = draft.address?.trim() || t('defaultAddress')
  const propertyType = draft.propertyType?.trim() || t('defaultPropertyType')

  const hasImage = draft.images && draft.images.length > 0
  const imageUrl = hasImage ? draft.images![0] : DEFAULT_IMAGE

  const createdAtLabel = React.useMemo(() => {
    if (!draft.createdAt) return t('justSaved')
    try {
      return formatDate(draft.createdAt)
    } catch {
      return t('justSaved')
    }
  }, [draft.createdAt, t])

  const priceLabel =
    typeof draft.price === 'number' && draft.price > 0
      ? `${new Intl.NumberFormat().format(draft.price)}đ`
      : t('notProvided')
  const hasPrice = typeof draft.price === 'number' && draft.price > 0

  const areaLabel =
    typeof draft.area === 'number' && draft.area > 0
      ? `${draft.area} m²`
      : t('notProvided')
  const hasArea = typeof draft.area === 'number' && draft.area > 0

  const bedroomsLabel =
    typeof draft.bedrooms === 'number'
      ? String(draft.bedrooms)
      : t('notProvided')
  const hasBedrooms = typeof draft.bedrooms === 'number'

  const bathroomsLabel =
    typeof draft.bathrooms === 'number'
      ? String(draft.bathrooms)
      : t('notProvided')
  const hasBathrooms = typeof draft.bathrooms === 'number'

  const completionItems = [
    !!draft.title?.trim(),
    !!draft.description?.trim(),
    !!draft.address?.trim(),
    typeof draft.price === 'number' && draft.price > 0,
    typeof draft.area === 'number' && draft.area > 0,
    typeof draft.bedrooms === 'number',
    typeof draft.bathrooms === 'number',
    hasImage,
  ]

  const completionScore = completionItems.filter(Boolean).length
  const completionPercent = Math.round(
    (completionScore / completionItems.length) * 100,
  )
  const completionLabel =
    completionPercent >= 80
      ? t('completionHigh')
      : completionPercent >= 50
        ? t('completionMedium')
        : t('completionLow')

  const missingFields = [
    !hasPrice ? t('price') : null,
    !hasArea ? t('area') : null,
    !hasBedrooms ? t('bedrooms') : null,
    !hasBathrooms ? t('bathrooms') : null,
    !hasImage ? t('noImage') : null,
  ].filter((item): item is string => Boolean(item))

  return (
    <Card
      className={cn(
        'group overflow-hidden border-border/70 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/5',
        className,
      )}
    >
      <CardContent className='p-0'>
        <div className='grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]'>
          <div className='relative h-52 w-full overflow-hidden bg-muted md:h-full md:min-h-[300px]'>
            {hasImage && (
              <Image
                src={imageUrl}
                alt=''
                fill
                aria-hidden
                className='object-cover blur-2xl scale-110 opacity-55 transition-all duration-300 group-hover:scale-125'
                unoptimized={false}
              />
            )}
            <Image
              src={imageUrl}
              alt={draftTitle}
              fill
              className={cn(
                'object-cover transition-all duration-300 md:object-contain md:p-4',
                hasImage && 'group-hover:brightness-105',
              )}
              unoptimized={!hasImage}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25' />

            {!hasImage && (
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/90'>
                <ImageOff className='h-6 w-6' />
                <p className='text-xs font-medium uppercase tracking-wide'>
                  {t('noImage')}
                </p>
              </div>
            )}

            <div className='absolute left-3 top-3 flex flex-wrap gap-2'>
              <Badge
                variant='secondary'
                className='border-border/60 bg-background/90 font-medium text-foreground backdrop-blur-sm dark:bg-background/80'
              >
                {propertyType}
              </Badge>
              <Badge className='border-yellow-400/40 bg-yellow-500/90 font-medium text-white hover:bg-yellow-500 dark:bg-yellow-500/85 dark:hover:bg-yellow-500'>
                {t('draft')}
              </Badge>
            </div>
          </div>

          <div className='flex min-w-0 flex-col'>
            <CardHeader className='px-5 pb-3 pt-5 sm:px-6'>
              <CardTitle className='line-clamp-2 text-lg leading-tight transition-colors group-hover:text-primary'>
                {draftTitle}
              </CardTitle>
              <CardDescription className='line-clamp-2 min-h-10 leading-relaxed'>
                {draftDescription}
              </CardDescription>

              <div className='rounded-lg border border-primary/20 bg-primary/5 p-3 dark:border-primary/25 dark:bg-primary/10'>
                <div className='mb-2 flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1.5 text-xs font-medium text-primary'>
                    <Sparkles className='h-3.5 w-3.5' />
                    {t('completion')}
                  </div>
                  <span className='text-xs font-medium text-muted-foreground'>
                    {completionPercent}% - {completionLabel}
                  </span>
                </div>
                <Progress value={completionPercent} className='h-1.5' />

                {missingFields.length > 0 && (
                  <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                    <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                      <CircleAlert className='h-3 w-3' />
                      {t('notProvided')}
                    </span>
                    {missingFields.slice(0, 3).map((field) => (
                      <Badge
                        key={field}
                        variant='outline'
                        className='h-5 rounded-full border-border/70 bg-background/70 px-2 text-[10px] font-medium text-muted-foreground dark:bg-background/50'
                      >
                        {field}
                      </Badge>
                    ))}
                    {missingFields.length > 3 && (
                      <Badge
                        variant='outline'
                        className='h-5 rounded-full border-border/70 bg-background/70 px-2 text-[10px] font-medium text-muted-foreground dark:bg-background/50'
                      >
                        +{missingFields.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className='flex items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 p-3 dark:border-primary/25 dark:bg-primary/10'>
                <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
                <p className='line-clamp-2 text-sm leading-relaxed text-foreground'>
                  {address}
                </p>
              </div>
            </CardHeader>

            <CardContent className='px-5 pb-4 sm:px-6'>
              <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
                <div
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    hasPrice
                      ? 'border-border/60 bg-muted/40 dark:bg-muted/30'
                      : 'border-dashed border-border/70 bg-muted/20 dark:bg-muted/10',
                  )}
                >
                  <div className='mb-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <DollarSign className='h-3.5 w-3.5' />
                    {t('price')}
                  </div>
                  <p
                    className={cn(
                      'truncate text-sm font-semibold',
                      !hasPrice && 'font-medium text-muted-foreground',
                    )}
                  >
                    {priceLabel}
                  </p>
                </div>
                <div
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    hasArea
                      ? 'border-border/60 bg-muted/40 dark:bg-muted/30'
                      : 'border-dashed border-border/70 bg-muted/20 dark:bg-muted/10',
                  )}
                >
                  <div className='mb-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <Maximize2 className='h-3.5 w-3.5' />
                    {t('area')}
                  </div>
                  <p
                    className={cn(
                      'truncate text-sm font-semibold',
                      !hasArea && 'font-medium text-muted-foreground',
                    )}
                  >
                    {areaLabel}
                  </p>
                </div>
                <div
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    hasBedrooms
                      ? 'border-border/60 bg-muted/40 dark:bg-muted/30'
                      : 'border-dashed border-border/70 bg-muted/20 dark:bg-muted/10',
                  )}
                >
                  <div className='mb-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <Bed className='h-3.5 w-3.5' />
                    {t('bedrooms')}
                  </div>
                  <p
                    className={cn(
                      'truncate text-sm font-semibold',
                      !hasBedrooms && 'font-medium text-muted-foreground',
                    )}
                  >
                    {bedroomsLabel}
                  </p>
                </div>
                <div
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    hasBathrooms
                      ? 'border-border/60 bg-muted/40 dark:bg-muted/30'
                      : 'border-dashed border-border/70 bg-muted/20 dark:bg-muted/10',
                  )}
                >
                  <div className='mb-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <Bath className='h-3.5 w-3.5' />
                    {t('bathrooms')}
                  </div>
                  <p
                    className={cn(
                      'truncate text-sm font-semibold',
                      !hasBathrooms && 'font-medium text-muted-foreground',
                    )}
                  >
                    {bathroomsLabel}
                  </p>
                </div>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className='mt-auto flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>{createdAtLabel}</span>
              </div>

              <div className='flex w-full gap-2 sm:w-auto'>
                {onEdit && (
                  <Button
                    variant='default'
                    size='sm'
                    onClick={onEdit}
                    className='flex-1 sm:flex-none'
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    {t('edit')}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={onDelete}
                    className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </CardFooter>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
