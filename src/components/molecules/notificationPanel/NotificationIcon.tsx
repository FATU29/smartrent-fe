import React from 'react'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/api/types/notification.type'
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Ban,
  RotateCcw,
} from 'lucide-react'

/**
 * Maps a NotificationType to a themed icon + color class.
 */
export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'LISTING_APPROVED':
      return {
        icon: CheckCircle,
        className: 'text-green-500',
      }
    case 'LISTING_REJECTED':
      return {
        icon: XCircle,
        className: 'text-red-500',
      }
    case 'LISTING_REVISION_REQUIRED':
      return {
        icon: AlertTriangle,
        className: 'text-yellow-500',
      }
    case 'LISTING_SUSPENDED':
      return {
        icon: Ban,
        className: 'text-red-600',
      }
    case 'LISTING_RESUBMITTED':
      return {
        icon: RotateCcw,
        className: 'text-blue-500',
      }
    case 'NEW_REPORT':
      return {
        icon: ShieldAlert,
        className: 'text-orange-500',
      }
    case 'REPORT_RESOLVED':
      return {
        icon: CheckCircle,
        className: 'text-green-500',
      }
    case 'REPORT_REJECTED':
      return {
        icon: XCircle,
        className: 'text-gray-500',
      }
    case 'REPORT_ACTION_REQUIRED':
      return {
        icon: AlertTriangle,
        className: 'text-orange-600',
      }
    default:
      return {
        icon: Bell,
        className: 'text-muted-foreground',
      }
  }
}

interface NotificationIconProps {
  type: NotificationType
  className?: string
  size?: number
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  type,
  className,
  size = 18,
}) => {
  const { icon: Icon, className: colorClass } = getNotificationIcon(type)
  return <Icon className={cn(colorClass, className)} size={size} />
}
