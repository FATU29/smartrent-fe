import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaCarouselType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '@/lib/utils'

interface CarouselOptions {
  align?: 'start' | 'center' | 'end'
  skipSnaps?: boolean
  containScroll?: 'trimSnaps'
  dragFree?: boolean
}

interface CarouselProps {
  children: React.ReactNode
  className?: string
  options?: CarouselOptions
  autoplay?: boolean | { delay?: number; stopOnInteraction?: boolean }
  loop?: boolean
}

interface CarouselContextValue {
  embla?: EmblaCarouselType
  selectedIndex: number
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | undefined>(
  undefined,
)

export const useCarousel = () => {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error('useCarousel must be used within <Carousel>')
  return ctx
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  options,
  autoplay = false,
  loop = true,
}) => {
  const plugins = React.useMemo(() => {
    if (!autoplay) return []
    const cfg = typeof autoplay === 'object' ? autoplay : { delay: 4000 }
    return [
      Autoplay({
        delay: cfg.delay ?? 4000,
        stopOnInteraction: cfg.stopOnInteraction ?? true,
      }),
    ]
  }, [autoplay])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop, ...(options || {}) },
    plugins,
  )
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const scrollTo = React.useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi],
  )

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      embla: emblaApi,
      selectedIndex,
      scrollTo,
      canScrollPrev,
      canScrollNext,
    }),
    [emblaApi, selectedIndex, scrollTo, canScrollPrev, canScrollNext],
  )

  // Split slide items (CarouselItem) and any other children (controls, indicators)
  const slideChildren: React.ReactNode[] = []
  const controlChildren: React.ReactNode[] = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      controlChildren.push(child)
      return
    }
    const typeDisplay = (child.type as { displayName?: string })?.displayName
    const cls: string | undefined = (child.props as { className?: string })
      ?.className
    const isSlide =
      typeDisplay === 'CarouselItem' || (cls ? /flex-\[0_0_/.test(cls) : false)
    if (isSlide) {
      slideChildren.push(child)
    } else {
      controlChildren.push(child)
    }
  })

  return (
    <CarouselContext.Provider value={contextValue}>
      <div className={cn('relative', className)}>
        <div className='overflow-hidden' ref={emblaRef}>
          <div className='flex'>{slideChildren}</div>
        </div>
        {controlChildren}
      </div>
    </CarouselContext.Provider>
  )
}

export const CarouselItem: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div
      className={cn(
        // 100% width slide (no responsive multi-column)
        'min-w-0 flex-[0_0_100%] px-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
CarouselItem.displayName = 'CarouselItem'

export const CarouselPrev: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { embla, canScrollPrev } = useCarousel()
  return (
    <button
      type='button'
      aria-label='Previous'
      onClick={() => embla?.scrollPrev()}
      disabled={!canScrollPrev}
      className={cn(
        'absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow border flex items-center justify-center text-sm disabled:opacity-40',
        className,
      )}
    >
      ‹
    </button>
  )
}

export const CarouselNext: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { embla, canScrollNext } = useCarousel()
  return (
    <button
      type='button'
      aria-label='Next'
      onClick={() => embla?.scrollNext()}
      disabled={!canScrollNext}
      className={cn(
        'absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow border flex items-center justify-center text-sm disabled:opacity-40',
        className,
      )}
    >
      ›
    </button>
  )
}

export const CarouselIndicators: React.FC<{
  className?: string
  dotClassName?: string
}> = ({ className, dotClassName }) => {
  const { embla, selectedIndex, scrollTo } = useCarousel()
  const [snaps, setSnaps] = React.useState<number[]>([])

  React.useEffect(() => {
    if (!embla) return
    const update = () => setSnaps(embla.scrollSnapList())
    update()
    embla.on('reInit', update)
    return () => {
      embla.off('reInit', update)
    }
  }, [embla])

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <div className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:bg-black/50 dark:ring-white/10'>
        {snaps.map((snap, i) => (
          <button
            key={`slide-${snap}-${i}`}
            onClick={() => scrollTo(i)}
            className={cn(
              'h-2 w-2 rounded-full bg-neutral-400/60 hover:bg-neutral-700 dark:bg-neutral-400/40 dark:hover:bg-neutral-200 transition-colors',
              i === selectedIndex && 'bg-primary dark:bg-primary w-3',
              dotClassName,
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

const CarouselExport = {
  Root: Carousel,
  Item: CarouselItem,
  Prev: CarouselPrev,
  Next: CarouselNext,
  Indicators: CarouselIndicators,
}

export default CarouselExport
