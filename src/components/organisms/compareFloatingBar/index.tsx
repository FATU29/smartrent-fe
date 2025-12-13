import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, ChevronUp, MoreVertical, X, Trash2 } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { useCompareStore } from '@/store/compare/useCompareStore'
import { cn } from '@/lib/utils'
import { ListingApi } from '@/api/types/property.type'

interface CompareFloatingBarProps {
  className?: string
}

interface CompareDropdownMenuProps {
  count: number
  compareList: ListingApi[]
  onRemove: (listingId: number) => void
  onClearAll: () => void
  getListingImage: (listing: ListingApi) => string
}

const CompareDropdownMenu: React.FC<CompareDropdownMenuProps> = ({
  count,
  compareList,
  onRemove,
  onClearAll,
  getListingImage,
}) => {
  const t = useTranslations('compare')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 shrink-0 hover:bg-muted'
        >
          <MoreVertical className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-64 max-h-[400px] overflow-y-auto'
      >
        <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
          {t('floatingBar.items', { count })}
        </div>
        <DropdownMenuSeparator />
        <div className='max-h-[300px] overflow-y-auto'>
          {compareList.map((listing) => (
            <DropdownMenuItem
              key={listing.listingId}
              className='flex items-center gap-2 px-2 py-2 cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                onRemove(listing.listingId)
              }}
            >
              <div className='relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0'>
                <Image
                  src={getListingImage(listing)}
                  alt={listing.title}
                  fill
                  className='object-cover'
                  unoptimized={getListingImage(listing).includes('default')}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{listing.title}</p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive'
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(listing.listingId)
                }}
              >
                <X className='w-3.5 h-3.5' />
              </Button>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='flex items-center gap-2 px-2 py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10'
          onClick={(e) => {
            e.stopPropagation()
            onClearAll()
          }}
        >
          <Trash2 className='w-4 h-4' />
          <span className='text-sm font-medium'>{t('actions.clearAll')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  className,
}) => {
  const t = useTranslations('compare')
  const router = useRouter()
  const { compareList, removeFromCompare, clearCompare } = useCompareStore()
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show/hide based on compare list and current route
  useEffect(() => {
    if (isMounted) {
      // Hide on compare page itself
      const isOnComparePage = router.pathname === '/compare'
      setIsVisible(compareList.length > 0 && !isOnComparePage)
    }
  }, [isMounted, compareList.length, router.pathname])

  // Reset collapsed state when compare list changes
  useEffect(() => {
    if (compareList.length === 0) {
      setIsCollapsed(false)
    }
  }, [compareList.length])

  if (!isMounted || !isVisible) {
    return null
  }

  const count = compareList.length

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev)
  }

  // Get primary image for listing
  const getListingImage = (listing: (typeof compareList)[0]) => {
    const coverImage = listing.media?.find(
      (m) =>
        m.mediaType === 'IMAGE' &&
        m.isPrimary &&
        m.sourceType !== 'YOUTUBE' &&
        !m.url?.includes('youtube.com') &&
        !m.url?.includes('youtu.be'),
    )
    return coverImage?.url || '/images/default-image.jpg'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
            'bg-background/95 backdrop-blur-md border border-border rounded-full shadow-lg',
            'flex items-center gap-3 transition-all duration-300',
            isCollapsed ? 'px-3 py-2' : 'px-4 py-3',
            className,
          )}
        >
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className='flex items-center gap-3 overflow-hidden'
            >
              <CompareDropdownMenu
                count={count}
                compareList={compareList}
                onRemove={removeFromCompare}
                onClearAll={clearCompare}
                getListingImage={getListingImage}
              />

              <Badge
                variant='default'
                className='text-sm font-semibold shrink-0'
              >
                {count === 1
                  ? t('floatingBar.items', { count })
                  : t('floatingBar.items_plural', { count })}
              </Badge>

              <Link href='/compare'>
                <Button size='sm' className='gap-2 shrink-0'>
                  {t('floatingBar.compareNow')}
                </Button>
              </Link>
            </motion.div>
          )}

          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex items-center gap-2'
            >
              <CompareDropdownMenu
                count={count}
                compareList={compareList}
                onRemove={removeFromCompare}
                onClearAll={clearCompare}
                getListingImage={getListingImage}
              />

              <Badge variant='default' className='text-sm font-semibold'>
                {count === 1
                  ? t('floatingBar.items', { count })
                  : t('floatingBar.items_plural', { count })}
              </Badge>
            </motion.div>
          )}

          <Button
            variant='ghost'
            size='icon'
            onClick={handleToggle}
            className='h-7 w-7 shrink-0 hover:bg-muted'
            aria-label={isCollapsed ? 'Show compare bar' : 'Hide compare bar'}
          >
            {isCollapsed ? (
              <ChevronUp className='w-4 h-4' />
            ) : (
              <ChevronDown className='w-4 h-4' />
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CompareFloatingBar
