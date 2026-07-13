import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { ModerationStatus } from '@/api/types/property.type'
import {
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  RefreshCw,
  Ban,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModerationStatusBadgeProps {
  status: ModerationStatus
  // Legacy fallback: older rows that predate the REMOVED status still carry
  // SUSPENDED + permanentlyRemoved=true. Treat those as REMOVED.
  permanentlyRemoved?: boolean
  className?: string
}

const BADGE_CONFIG: Record<
  ModerationStatus,
  {
    icon: React.ElementType
    className: string
  }
> = {
  [ModerationStatus.PENDING_REVIEW]: {
    icon: Clock,
    className:
      'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  [ModerationStatus.APPROVED]: {
    icon: CheckCircle,
    className:
      'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  },
  [ModerationStatus.REJECTED]: {
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  },
  [ModerationStatus.REVISION_REQUIRED]: {
    icon: Edit,
    className:
      'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  },
  [ModerationStatus.RESUBMITTED]: {
    icon: RefreshCw,
    className:
      'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  },
  // SUSPENDED now means "temporarily hidden under report review".
  [ModerationStatus.SUSPENDED]: {
    icon: EyeOff,
    className:
      'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  },
  [ModerationStatus.REMOVED]: {
    icon: Ban,
    className:
      'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  },
}

export const ModerationStatusBadge: React.FC<ModerationStatusBadgeProps> = ({
  status,
  permanentlyRemoved,
  className,
}) => {
  const t = useTranslations('seller.moderation.status')
  const effectiveStatus = permanentlyRemoved ? ModerationStatus.REMOVED : status
  const config = BADGE_CONFIG[effectiveStatus]

  if (!config) return null

  const Icon = config.icon

  return (
    <Badge variant='outline' className={cn(config.className, className)}>
      <Icon className='w-3.5 h-3.5 mr-1' />
      {t(effectiveStatus)}
    </Badge>
  )
}
