'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/atoms/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StatCard {
  icon: React.ReactNode
  value: string | number
  label: string
  gradient: string
}

interface StatsCarouselProps {
  stats: StatCard[]
}

export default function StatsCarousel({ stats }: StatsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    if (Math.abs(translateX) > 50) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      } else if (translateX < 0 && currentIndex < stats.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      }
    }

    setTranslateX(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const currentX = e.clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    if (Math.abs(translateX) > 50) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      } else if (translateX < 0 && currentIndex < stats.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      }
    }

    setTranslateX(0)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(stats.length - 1, prev + 1))
  }

  return (
    <div className='relative'>
      {/* Carousel Container */}
      <div className='overflow-hidden'>
        <div
          ref={carouselRef}
          role='region'
          aria-label='Statistics carousel'
          className='flex transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing'
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {stats.map((stat, index) => (
            <div key={index} className='min-w-full px-2'>
              <Card className={`p-6 ${stat.gradient}`}>
                <div className='flex items-center justify-between mb-2'>
                  <div className='text-gray-600'>{stat.icon}</div>
                </div>
                <p className='text-3xl font-bold text-gray-900 mb-1'>
                  {stat.value}
                </p>
                <p className='text-sm font-medium text-gray-600'>
                  {stat.label}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than 1 stat */}
      {stats.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white rounded-full p-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors z-10'
            aria-label='Previous stat'
          >
            <ChevronLeft className='h-5 w-5 text-gray-700' />
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex === stats.length - 1}
            className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white rounded-full p-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors z-10'
            aria-label='Next stat'
          >
            <ChevronRight className='h-5 w-5 text-gray-700' />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {stats.length > 1 && (
        <div className='flex justify-center gap-2 mt-4'>
          {stats.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to stat ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
