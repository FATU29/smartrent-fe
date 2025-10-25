import {
  BarChart3,
  Shield,
  Copy,
  MessageCircle,
  Share,
  Clock,
  Megaphone,
  RefreshCw,
  TrendingDown,
  Trash2,
} from 'lucide-react'

export interface DropdownMenuItem {
  id: string
  icon: React.ReactNode
  labelKey: string
  onClick?: () => void
  className?: string
  show?: boolean
}

export const createMenuItems = ({
  onViewReport,
  onRequestVerification,
  onCopyListing,
  onRequestContact,
  onShare,
  onActivityHistory,
  onPromote,
  onRepost,
  onTakeDown,
  onDelete,
  showPromoteButton,
  showRepostButton,
}: {
  onViewReport?: () => void
  onRequestVerification?: () => void
  onCopyListing?: () => void
  onRequestContact?: () => void
  onShare?: () => void
  onActivityHistory?: () => void
  onPromote?: () => void
  onRepost?: () => void
  onTakeDown?: () => void
  onDelete?: () => void
  showPromoteButton?: boolean
  showRepostButton?: boolean
}): DropdownMenuItem[] => [
  {
    id: 'viewReport',
    icon: <BarChart3 size={14} />,
    labelKey: 'viewReport',
    onClick: onViewReport,
  },
  {
    id: 'requestVerification',
    icon: <Shield size={14} />,
    labelKey: 'requestVerification',
    onClick: onRequestVerification,
  },
  {
    id: 'copyListing',
    icon: <Copy size={14} />,
    labelKey: 'copyListing',
    onClick: onCopyListing,
  },
  {
    id: 'requestContact',
    icon: <MessageCircle size={14} />,
    labelKey: 'requestContact',
    onClick: onRequestContact,
  },
  {
    id: 'share',
    icon: <Share size={14} />,
    labelKey: 'share',
    onClick: onShare,
  },
  {
    id: 'activityHistory',
    icon: <Clock size={14} />,
    labelKey: 'activityHistory',
    onClick: onActivityHistory,
  },
  {
    id: 'promote',
    icon: <Megaphone size={14} />,
    labelKey: 'promoteFull',
    onClick: onPromote,
    show: showPromoteButton,
  },
  {
    id: 'repost',
    icon: <RefreshCw size={14} />,
    labelKey: 'repostFull',
    onClick: onRepost,
    show: showRepostButton,
  },
  {
    id: 'takeDown',
    icon: <TrendingDown size={14} />,
    labelKey: 'takeDown',
    onClick: onTakeDown,
    className: 'text-orange-600',
  },
  {
    id: 'delete',
    icon: <Trash2 size={14} />,
    labelKey: 'delete',
    onClick: onDelete,
    className: 'text-red-600',
  },
]
