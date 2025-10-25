'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
    icon?: React.ComponentType
  }
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }
  return context
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart=''
        ref={ref}
        className={cn(
          'flex aspect-auto w-full justify-center text-xs',
          className,
        )}
        style={
          {
            ...Object.entries(config).reduce(
              (acc, [key, value]) => {
                if (value.color) {
                  acc[`--color-${key}`] = value.color
                }
                return acc
              },
              {} as Record<string, string>,
            ),
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

export const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-background p-2 shadow-md', className)}
      {...props}
    />
  )
})
ChartTooltip.displayName = 'ChartTooltip'

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    active?: boolean
    payload?: Array<{
      color?: string
      dataKey?: string
      formatter?: (value: unknown) => string
      name?: string
      payload?: unknown
      value?: unknown
    }>
    labelFormatter?: (value: unknown, payload: unknown[]) => React.ReactNode
    label?: string
    indicator?: 'dot' | 'line' | 'dashed'
    hideLabel?: boolean
    hideIndicator?: boolean
    className?: string
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
    },
    ref,
  ) => {
    const { config } = useChart()

    if (!active || !payload || payload.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {!hideLabel && label && (
          <div className='font-medium text-muted-foreground'>
            {labelFormatter ? labelFormatter(label, payload) : label}
          </div>
        )}
        <div className='grid gap-1.5'>
          {payload.map((item, index) => {
            const key = `${item.dataKey || item.name || index}`
            const itemConfig = config[item.dataKey as string]
            const value = item.formatter
              ? item.formatter(item.value)
              : item.value?.toString()

            return (
              <div
                key={key}
                className='flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground'
              >
                {!hideIndicator && (
                  <div
                    className='shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]'
                    style={
                      {
                        '--color-bg': item.color,
                        '--color-border': item.color,
                        height: indicator === 'dot' ? '0.5rem' : '100%',
                        width: indicator === 'dot' ? '0.5rem' : '0.125rem',
                        marginTop: indicator === 'dot' ? '0.25rem' : 0,
                      } as React.CSSProperties
                    }
                  />
                )}
                <div className='flex flex-1 justify-between leading-none'>
                  <div className='grid gap-1.5'>
                    <span className='text-muted-foreground'>
                      {itemConfig?.label || item.name}
                    </span>
                  </div>
                  <span className='font-mono font-medium tabular-nums text-foreground'>
                    {value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

export const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-center gap-4', className)}
      {...props}
    />
  )
})
ChartLegend.displayName = 'ChartLegend'

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    payload?: Array<{
      value: string
      type?: string
      color?: string
    }>
  }
>(({ className, payload }, ref) => {
  const { config } = useChart()

  if (!payload) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap items-center justify-center gap-4',
        className,
      )}
    >
      {payload.map((item) => {
        const key = item.value
        const itemConfig = config[key]

        return (
          <div key={key} className='flex items-center gap-1.5 text-xs'>
            <div
              className='h-2 w-2 shrink-0 rounded-[2px]'
              style={{
                backgroundColor: item.color,
              }}
            />
            <span className='text-muted-foreground'>
              {itemConfig?.label || item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegendContent'
