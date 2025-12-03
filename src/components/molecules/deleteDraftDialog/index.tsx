import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'

interface DeleteDraftDialogProps {
  open: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isDeleting?: boolean
}

const DIALOG_MAX_WIDTH = 'sm:max-w-[425px]'

export const DeleteDraftDialog: React.FC<DeleteDraftDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const t = useTranslations('seller.drafts.delete')

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent
        className={DIALOG_MAX_WIDTH}
        showCloseButton={!isDeleting}
        onInteractOutside={(e) => {
          if (isDeleting) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isDeleting) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('confirmTitle')}</DialogTitle>
          <DialogDescription>{t('confirmMessage')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={onCancel} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
