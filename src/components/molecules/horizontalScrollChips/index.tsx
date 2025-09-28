import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { Wrapper, ScrollContainer, FadeEdge } from './index.style'

export interface HorizontalScrollChipsProps {
  items: string[]
  onSelect?: (value: string) => void
  className?: string
  /** If true, shows gradient fade edges */
  fadeEdges?: boolean
}

const HorizontalScrollChips: React.FC<HorizontalScrollChipsProps> = ({
  items,
  onSelect,
  className,
  fadeEdges = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDown = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const [canScroll, setCanScroll] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      setCanScroll(el.scrollWidth > el.clientWidth)
    }
  }, [items])

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    isDown.current = true
    startX.current = e.pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
  }

  const endDrag = () => {
    isDown.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!isDown.current || !el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX.current) * 1.2
    el.scrollLeft = scrollLeft.current - walk
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const el = containerRef.current
    if (!el) return
    startX.current = e.touches[0].pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    const el = containerRef.current
    if (!el) return
    const x = e.touches[0].pageX - el.offsetLeft
    const walk = (x - startX.current) * 1.2
    el.scrollLeft = scrollLeft.current - walk
  }

  return (
    <Wrapper className={cn(className)}>
      {fadeEdges && canScroll && (
        <>
          <FadeEdge $position='left' />
          <FadeEdge $position='right' />
        </>
      )}
      <ScrollContainer
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={endDrag}
        onMouseUp={endDrag}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {items.map((item) => (
          <Button
            key={item}
            variant='secondary'
            size='sm'
            className='rounded-full whitespace-nowrap'
            onClick={() => onSelect?.(item)}
          >
            {item}
          </Button>
        ))}
      </ScrollContainer>
    </Wrapper>
  )
}

export default HorizontalScrollChips
