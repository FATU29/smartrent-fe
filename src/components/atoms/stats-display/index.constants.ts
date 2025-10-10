import { Eye, Phone, Users } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface StatsItem {
  key: 'views' | 'contacts' | 'customers'
  icon: LucideIcon
  labelKey: string
  bgColor: string
  textColor: string
}

export const STATS_ITEMS: StatsItem[] = [
  {
    key: 'views',
    icon: Eye,
    labelKey: 'components.statsDisplay.views',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'contacts',
    icon: Phone,
    labelKey: 'components.statsDisplay.contacts',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    key: 'customers',
    icon: Users,
    labelKey: 'components.statsDisplay.customers',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
]

export const STATS_DISPLAY_STYLES = {
  container: 'flex items-center gap-3 sm:gap-4',
  item: 'flex flex-col items-center text-center group cursor-default transition-all duration-200 hover:scale-105',
  iconContainer:
    'p-1.5 rounded-full transition-all duration-200 group-hover:scale-110',
  icon: 'w-4 h-4 transition-all duration-200',
  label:
    'text-xs text-muted-foreground whitespace-nowrap mt-1 group-hover:text-foreground transition-colors duration-200',
  value:
    'font-semibold text-sm mt-0.5 tabular-nums group-hover:text-primary transition-colors duration-200',
} as const

export const STATS_ANIMATIONS = {
  fadeIn: 'animate-in fade-in-50 duration-300',
  slideUp: 'animate-in slide-in-from-bottom-2 duration-300',
  pulse: 'animate-pulse',
} as const

export const formatStatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}
