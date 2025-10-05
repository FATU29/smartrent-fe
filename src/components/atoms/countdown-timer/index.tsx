interface CountdownTimerProps {
  count: number
  isActive: boolean
  className?: string
}

export default function CountdownTimer({
  count,
  isActive,
  className = '',
}: CountdownTimerProps) {
  const progress = isActive ? ((5 - count) / 5) * 100 : 0

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className='relative w-12 h-12 sm:w-16 sm:h-16'>
        <svg
          className='absolute inset-0 w-full h-full transform -rotate-90'
          viewBox='0 0 36 36'
        >
          <circle
            cx='18'
            cy='18'
            r='16'
            fill='none'
            className='stroke-gray-200 stroke-2'
          />
          <circle
            cx='18'
            cy='18'
            r='16'
            fill='none'
            className='stroke-blue-600 stroke-2 transition-all duration-1000 ease-linear'
            strokeDasharray='100'
            strokeDashoffset={100 - progress}
            strokeLinecap='round'
          />
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-sm sm:text-base font-bold text-blue-600 tabular-nums'>
            {count}
          </span>
        </div>
      </div>
      <p className='mt-2 text-xs text-gray-500 tabular-nums'>
        {count > 0 ? `${count}s` : ''}
      </p>
    </div>
  )
}
