import React from 'react'
import { useTranslations } from 'next-intl'
import { Edit, MoreHorizontal, ChevronsUp, SendHorizontal } from 'lucide-react'
import { createMenuItems } from './index.constants'
import { Button } from '@/components/atoms/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemComponent,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'

export interface ListingCardActionsProps {
  onEdit?: () => void
  onPromote?: () => void
  onRepost?: () => void
  onResubmit?: () => void
  onCopyListing?: () => void
  onTakeDown?: () => void
  onDelete?: () => void
  showPromoteButton?: boolean
  showRepostButton?: boolean
  showResubmitButton?: boolean
  className?: string
}

export const ListingCardActions: React.FC<ListingCardActionsProps> = ({
  onEdit,
  onPromote,
  onRepost,
  onResubmit,
  onCopyListing,
  onTakeDown,
  onDelete,
  showPromoteButton = true,
  showRepostButton = false,
  showResubmitButton = false,
  className,
}) => {
  const t = useTranslations('seller.listingManagement.card.actions')

  const menuItems = createMenuItems({
    onCopyListing,
    onPromote,
    onTakeDown,
    onDelete,
    showPromoteButton,
  })

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        variant='ghost'
        size='sm'
        onClick={onEdit}
        className='gap-1 text-muted-foreground hover:text-foreground text-xs sm:text-sm'
      >
        <Edit size={14} />
        <span className='hidden xs:inline'>{t('editFull')}</span>
        <span className='xs:hidden'>{t('edit')}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='sm' className='p-1'>
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          {menuItems.map((item) => {
            if (item.show !== undefined && !item.show) return null

            return (
              <DropdownMenuItemComponent
                key={item.id}
                onClick={item.onClick}
                className={item.className}
              >
                <span className='mr-2'>{item.icon}</span>
                {t(item.labelKey)}
              </DropdownMenuItemComponent>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {showPromoteButton && (
        <Button
          variant='outline'
          size='sm'
          onClick={onPromote}
          className='gap-1 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10 text-xs sm:text-sm'
        >
          <ChevronsUp size={14} />
          <span className='hidden xs:inline'>{t('promoteFull')}</span>
          <span className='xs:hidden'>{t('promote')}</span>
        </Button>
      )}

      {showRepostButton && (
        <Button
          onClick={onRepost}
          size='sm'
          className='gap-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm'
        >
          <ChevronsUp size={14} />
          <span className='hidden xs:inline'>{t('repostFull')}</span>
          <span className='xs:hidden'>{t('repost')}</span>
        </Button>
      )}

      {showResubmitButton && (
        <Button
          onClick={onResubmit}
          size='sm'
          className='gap-1 bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700 text-xs sm:text-sm'
        >
          <SendHorizontal size={14} />
          <span className='hidden xs:inline'>{t('resubmitFull')}</span>
          <span className='xs:hidden'>{t('resubmit')}</span>
        </Button>
      )}
    </div>
  )
}
