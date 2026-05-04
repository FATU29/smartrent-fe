import { Copy, ChevronsUp, TrendingDown, Trash2 } from 'lucide-react'

export interface DropdownMenuItem {
  id: string
  icon: React.ReactNode
  labelKey: string
  onClick?: () => void
  className?: string
  show?: boolean
}

export const createMenuItems = ({
  onCopyListing,
  onPromote,
  onTakeDown,
  onDelete,
  showPromoteButton,
}: {
  onCopyListing?: () => void
  onPromote?: () => void
  onTakeDown?: () => void
  onDelete?: () => void
  showPromoteButton?: boolean
}): DropdownMenuItem[] => [
  {
    id: 'copyListing',
    icon: <Copy size={14} />,
    labelKey: 'copyListing',
    onClick: onCopyListing,
  },
  {
    id: 'promote',
    icon: <ChevronsUp size={14} />,
    labelKey: 'promoteFull',
    onClick: onPromote,
    show: showPromoteButton,
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
