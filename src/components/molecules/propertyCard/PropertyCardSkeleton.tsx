import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { cn } from '@/lib/utils'

interface PropertyCardSkeletonProps {
  className?: string
  count?: number
  imageLayout?: 'left' | 'top'
}

export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  className,
  count = 1,
  imageLayout = 'left',
}) => {
  const isTopLayout = imageLayout === 'top'
  const isCompact = className?.includes('compact')

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          className={cn(
            'overflow-hidden animate-pulse border-border/60',
            isCompact
              ? isTopLayout
                ? 'flex flex-col'
                : 'flex flex-row h-auto min-h-[140px] md:min-h-[160px]'
              : 'flex flex-col',
            className,
          )}
        >
          <CardContent className='p-0'>
            <div
              className={cn(
                'flex',
                isTopLayout ? 'flex-col' : isCompact ? 'flex-row' : 'flex-col',
              )}
            >
              {/* Image Section */}
              {isTopLayout ? (
                <div className='p-2 pb-1'>
                  <div className='flex gap-2'>
                    {/* Main Image */}
                    <div className='relative flex-1 aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg'>
                      <Skeleton className='w-full h-full' />
                      {/* Badges */}
                      <div className='absolute top-2 left-2 flex flex-col gap-1.5'>
                        <Skeleton className='w-16 h-5 rounded-full' />
                      </div>
                      <div className='absolute top-2 right-2 flex gap-1.5'>
                        <Skeleton className='w-8 h-8 rounded-full' />
                        <Skeleton className='w-8 h-8 rounded-full' />
                      </div>
                      <div className='absolute bottom-2 left-2'>
                        <Skeleton className='w-14 h-5 rounded-full' />
                      </div>
                    </div>
                    {/* Thumbnails */}
                    <div className='flex flex-col gap-1.5 w-12 md:w-14'>
                      {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton
                          key={i}
                          className='aspect-square rounded-lg'
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'relative overflow-hidden flex-shrink-0',
                    isCompact
                      ? 'w-40 md:w-48 h-full min-h-[140px] md:min-h-[160px]'
                      : 'aspect-[4/3]',
                  )}
                >
                  <Skeleton className='w-full h-full' />
                  {/* Badges */}
                  <div
                    className={cn(
                      'absolute flex flex-col gap-1',
                      isCompact
                        ? 'top-1 left-1 gap-0.5'
                        : 'top-2 left-2 sm:top-3 sm:left-3',
                    )}
                  >
                    <Skeleton
                      className={cn(
                        'rounded-full',
                        isCompact ? 'w-12 h-4' : 'w-16 h-5',
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      'absolute flex gap-1',
                      isCompact ? 'top-1 right-1' : 'top-2 right-2',
                    )}
                  >
                    <Skeleton
                      className={cn(
                        'rounded-full',
                        isCompact ? 'w-6 h-6' : 'w-8 h-8',
                      )}
                    />
                    <Skeleton
                      className={cn(
                        'rounded-full',
                        isCompact ? 'w-6 h-6' : 'w-8 h-8',
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div
                className={cn(
                  'flex-1 min-w-0 flex flex-col',
                  isTopLayout
                    ? 'px-3 pb-3 pt-2'
                    : isCompact
                      ? 'p-2.5'
                      : 'p-3 sm:p-4',
                )}
              >
                {/* Title & Badge */}
                <div className='flex items-start justify-between gap-2 mb-2.5'>
                  <div className='flex-1 space-y-1'>
                    <Skeleton
                      className={cn(
                        'rounded',
                        isCompact ? 'h-4 w-3/4' : 'h-4 w-4/5',
                      )}
                    />
                    <Skeleton
                      className={cn(
                        'rounded',
                        isCompact ? 'h-4 w-1/2' : 'h-4 w-2/3',
                      )}
                    />
                  </div>
                  <Skeleton className='h-5 w-16 rounded-full flex-shrink-0' />
                </div>

                {/* Address */}
                <div className='flex items-center gap-1.5 mb-2.5'>
                  <Skeleton className='w-3.5 h-3.5 rounded-full flex-shrink-0' />
                  <Skeleton className='h-3 w-2/3 rounded' />
                </div>

                {/* Price */}
                <div className='flex items-center justify-between mb-2.5'>
                  <Skeleton
                    className={cn(
                      'rounded',
                      isCompact ? 'h-6 w-28' : 'h-6 w-32',
                    )}
                  />
                  {isCompact && <Skeleton className='h-4 w-20 rounded-full' />}
                </div>

                {/* Stats pills */}
                <div className='flex items-center gap-2 mb-2.5'>
                  {Array.from({ length: isCompact ? 4 : 3 }, (_, i) => (
                    <Skeleton key={i} className='h-8 w-16 rounded-lg' />
                  ))}
                </div>

                {/* Description (compact only) */}
                {isCompact && (
                  <div className='space-y-1 mb-2.5'>
                    <Skeleton className='h-3 w-full rounded' />
                    <Skeleton className='h-3 w-4/5 rounded' />
                  </div>
                )}

                {/* Amenities (non-compact) */}
                {!isCompact && (
                  <div className='flex flex-wrap gap-1.5 mb-3'>
                    {Array.from({ length: 3 }, (_, i) => (
                      <Skeleton key={i} className='h-7 w-20 rounded-full' />
                    ))}
                  </div>
                )}

                {/* Bottom Section - User Info */}
                {isCompact && (
                  <div className='flex items-center justify-between mt-auto pt-2.5 border-t border-border/60'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='w-7 h-7 rounded-full' />
                      <Skeleton className='h-3 w-20 rounded' />
                    </div>
                    <div className='flex items-center gap-1'>
                      <Skeleton className='w-3 h-3 rounded' />
                      <Skeleton className='h-3 w-16 rounded' />
                    </div>
                  </div>
                )}

                {/* Non-compact bottom */}
                {!isCompact && (
                  <div className='flex items-center justify-between mt-auto pt-3 border-t border-border/60'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-6 w-6 rounded-full' />
                      <Skeleton className='h-4 w-20' />
                    </div>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-8 w-8 rounded-full' />
                      <Skeleton className='h-8 w-8 rounded-full' />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
