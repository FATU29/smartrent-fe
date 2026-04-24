import React from 'react'
import { useTranslations } from 'next-intl'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/atoms/carousel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/tabs'
import { Typography } from '@/components/atoms/typography'
import PropertyCard from '@/components/molecules/propertyCard'
import SellerPublicProfileCard from '@/components/molecules/sellerPublicProfileCard'
import SellerPublicListings from '@/components/organisms/sellerPublicListings'
import PaginationControls from '@/components/molecules/paginationControls'
import { ListingDetail, UserApi, VipType } from '@/api/types'
import { AlertCircle } from 'lucide-react'
import { buildApartmentDetailRoute } from '@/constants/route'
import Link from 'next/link'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface SellerListingsSection {
  vipType: VipType
  listings: ListingDetail[]
  listingCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: string) => void
}

interface SellerPublicDetailTemplateProps {
  seller?: UserApi | null
  isSellerLoading?: boolean
  listingCount: number
  sections: SellerListingsSection[]
  topSavedListings?: ListingDetail[]
  isTopSavedLoading?: boolean
  isTopSavedError?: boolean
  onRetryTopSaved?: () => void
  pageSizeOptions?: string[]
  isLoading?: boolean
  isError?: boolean
  onRetryAll?: () => void
}

const SellerPublicDetailTemplate: React.FC<SellerPublicDetailTemplateProps> = ({
  seller,
  isSellerLoading = false,
  listingCount,
  sections,
  topSavedListings = [],
  isTopSavedLoading = false,
  isTopSavedError = false,
  onRetryTopSaved,
  pageSizeOptions = ['6', '12', '24'],
  isLoading = false,
  isError = false,
  onRetryAll,
}) => {
  const t = useTranslations('sellerDetailPage')
  const isMobile = useMediaQuery('(max-width: 767px)')

  const [activeTier, setActiveTier] = React.useState<VipType>('DIAMOND')
  const sectionRefs = React.useRef<
    Partial<Record<VipType, HTMLDivElement | null>>
  >({})

  const handleListingCardLinkClick = React.useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      const clickedButton =
        target.closest('[data-action-button]') ||
        target.closest('button') ||
        target.closest('[role="button"]')

      if (clickedButton) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [],
  )

  const scrollToTierSection = React.useCallback((vipType: VipType) => {
    const sectionElement = sectionRefs.current[vipType]
    if (!sectionElement) return

    window.requestAnimationFrame(() => {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  React.useEffect(() => {
    if (!sections.find((section) => section.vipType === activeTier)) {
      setActiveTier(sections[0]?.vipType || 'DIAMOND')
    }
  }, [activeTier, sections])

  const topListingFallback = React.useMemo(() => {
    const priority: VipType[] = ['DIAMOND', 'GOLD', 'SILVER', 'NORMAL']

    for (const vipType of priority) {
      const listing = sections.find((section) => section.vipType === vipType)
        ?.listings[0]
      if (listing) return listing
    }

    return null
  }, [sections])

  const topListings = React.useMemo(() => {
    if (topSavedListings.length > 0) {
      return topSavedListings
    }
    return topListingFallback ? [topListingFallback] : []
  }, [topListingFallback, topSavedListings])

  const getTierLabel = React.useCallback(
    (vipType: VipType) => {
      const labels: Record<VipType, string> = {
        DIAMOND: t('tiers.diamond'),
        GOLD: t('tiers.gold'),
        SILVER: t('tiers.silver'),
        NORMAL: t('tiers.normal'),
      }
      return labels[vipType]
    },
    [t],
  )

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-6'>
      {/* Page heading */}
      <div className='mb-6'>
        <Typography variant='h2' className='text-xl md:text-2xl'>
          {t('title')}
        </Typography>
        <Typography variant='p' className='text-muted-foreground mt-1'>
          {t('subtitle')}
        </Typography>
      </div>

      {/* Global error alert */}
      {isError &&
        !isLoading &&
        sections.every((section) => section.isError) && (
          <Alert variant='destructive' className='mb-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>{t('states.errorTitle')}</AlertTitle>
            <AlertDescription>
              <div className='flex flex-col gap-3'>
                <p>{t('states.errorDescription')}</p>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={onRetryAll}
                  className='w-fit'
                >
                  {t('actions.retry')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

      {/* Two-column layout: sticky profile (left) + content (right) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
        {/* Profile - Mobile: on top / Desktop: sticky left */}
        <aside className='lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-thin'>
          <SellerPublicProfileCard
            seller={seller}
            listingCount={listingCount}
            isLoading={isSellerLoading}
          />
        </aside>

        {/* Main content */}
        <div className='lg:col-span-8 space-y-8 min-w-0'>
          {(topListings.length > 0 || isTopSavedLoading || isTopSavedError) && (
            <section className='space-y-3'>
              <Typography variant='h3' className='text-lg md:text-xl'>
                {t('sections.topListingLove')}
              </Typography>

              {isTopSavedError && !isTopSavedLoading && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>{t('states.errorTitle')}</AlertTitle>
                  <AlertDescription>
                    <div className='flex flex-col gap-3'>
                      <p>{t('states.errorDescription')}</p>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={onRetryTopSaved}
                        className='w-fit'
                      >
                        {t('actions.retry')}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isTopSavedLoading && (
                <SellerPublicListings
                  listings={[]}
                  isLoading={isTopSavedLoading}
                />
              )}

              {!isTopSavedLoading && topListings.length > 0 && (
                <Carousel
                  opts={{ align: 'start', containScroll: 'trimSnaps' }}
                  className='w-full'
                >
                  <CarouselContent>
                    {topListings.map((listing) => (
                      <CarouselItem
                        key={listing.listingId}
                        className='basis-full sm:basis-1/2 min-w-[260px]'
                      >
                        <Link
                          href={buildApartmentDetailRoute(
                            listing.listingId.toString(),
                          )}
                          onClick={handleListingCardLinkClick}
                          className='block h-full'
                        >
                          <PropertyCard
                            listing={listing}
                            className='compact'
                            imageLayout='top'
                          />
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className='hidden md:flex -left-4' />
                  <CarouselNext className='hidden md:flex -right-4' />
                </Carousel>
              )}
            </section>
          )}

          <section className='space-y-4'>
            <div className='flex items-center justify-between gap-3'>
              <Typography variant='h3' className='text-lg md:text-xl'>
                {t('sections.listingsByTier')}
              </Typography>
              <Badge variant='outline'>
                {t('sections.totalListings', { count: listingCount })}
              </Badge>
            </div>

            <Tabs
              value={activeTier}
              onValueChange={(value) => setActiveTier(value as VipType)}
              className='space-y-3'
            >
              <div className='md:hidden'>
                <Select
                  value={activeTier}
                  onValueChange={(value) => setActiveTier(value as VipType)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.vipType} value={section.vipType}>
                        {getTierLabel(section.vipType)} ({section.listingCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TabsList className='hidden md:grid w-full h-auto bg-transparent p-0 md:grid-cols-4 gap-2'>
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.vipType}
                    value={section.vipType}
                    className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border rounded-md px-3 py-2'
                  >
                    {getTierLabel(section.vipType)} ({section.listingCount})
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map((section) => (
                <TabsContent
                  key={section.vipType}
                  value={section.vipType}
                  className='space-y-3 pt-2'
                >
                  <div
                    ref={(element) => {
                      sectionRefs.current[section.vipType] = element
                    }}
                    className='space-y-3 scroll-mt-24'
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <Typography variant='p' className='text-muted-foreground'>
                        {t('sections.tierSummary', {
                          tier: getTierLabel(section.vipType),
                          count: section.listingCount,
                        })}
                      </Typography>
                      <Badge variant='secondary'>
                        {t('sections.pageLabel', {
                          page: section.currentPage,
                          totalPages: section.totalPages,
                        })}
                      </Badge>
                    </div>

                    {section.isError && !section.isLoading && (
                      <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>{t('states.errorTitle')}</AlertTitle>
                        <AlertDescription>
                          <div className='flex flex-col gap-3'>
                            <p>{t('states.errorDescription')}</p>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => section.onRetry?.()}
                              className='w-fit'
                            >
                              {t('actions.retry')}
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <SellerPublicListings
                      listings={section.listings}
                      isLoading={isLoading || section.isLoading}
                    />

                    {!section.isLoading && section.listingCount > 0 && (
                      <PaginationControls
                        className='pt-2'
                        pagination={{
                          currentPage: section.currentPage,
                          pageSize: section.pageSize,
                          totalItems: section.listingCount,
                          totalPages: section.totalPages,
                        }}
                        currentSize={section.pageSize}
                        pageSizeOptions={
                          isMobile
                            ? Array.from(
                                new Set([
                                  '4',
                                  '6',
                                  '8',
                                  '12',
                                  section.pageSize.toString(),
                                ]),
                              )
                            : pageSizeOptions
                        }
                        showPerPageSelector
                        onPageChange={(page) => {
                          section.onPageChange?.(page)
                          scrollToTierSection(section.vipType)
                        }}
                        onSizeChange={(size) => {
                          section.onPageSizeChange?.(size)
                          scrollToTierSection(section.vipType)
                        }}
                      />
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  )
}

export default SellerPublicDetailTemplate
