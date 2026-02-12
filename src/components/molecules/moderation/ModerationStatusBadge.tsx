import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { ModerationStatus } from '@/api/types/property.type'
import { Clock, CheckCircle, XCircle, Edit, RefreshCw, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModerationStatusBadgeProps {
  status: ModerationStatus
  className?: string
}

const BADGE_CONFIG: Record<
  ModerationStatus,
  {
    icon: React.ElementType
    variant: string
    className: string
  }
> = {
  [ModerationStatus.PENDING_REVIEW]: {
    icon: Clock,
    variant: 'outline',
    className:
      'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  [ModerationStatus.APPROVED]: {
    icon: CheckCircle,
    variant: 'outline',
    className:
      'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  },
  [ModerationStatus.REJECTED]: {
    icon: XCircle,
    variant: 'outline',
    className:
      'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  },
  [ModerationStatus.REVISION_REQUIRED]: {
    icon: Edit,
    variant: 'outline',
    className:
      'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  },
  [ModerationStatus.RESUBMITTED]: {
    icon: RefreshCw,
    variant: 'outline',
    className:
      'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  },
  [ModerationStatus.SUSPENDED]: {
    icon: Ban,
    variant: 'outline',
    className:
      'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800',
  },
}

export const ModerationStatusBadge: React.FC<ModerationStatusBadgeProps> = ({
  status,
  className,
}) => {
  const t = useTranslations('seller.moderation.status')
  const config = BADGE_CONFIG[status]

  if (!config) return null

  const Icon = config.icon

  return (
    <Badge variant='outline' className={cn(config.className, className)}>
      <Icon className='w-3.5 h-3.5 mr-1' />
      {t(status)}
    </Badge>
  )
}
