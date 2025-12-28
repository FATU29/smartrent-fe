import React, { useCallback } from 'react'
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

interface SaveDraftDialogProps {
  open: boolean
  onSave: () => void | Promise<void>
  onCancel: () => void
  isSaving?: boolean
}

const DIALOG_MAX_WIDTH = 'sm:max-w-[425px]'

export const SaveDraftDialog: React.FC<SaveDraftDialogProps> = ({
  open,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const t = useTranslations('createPost.draftDialog')

  const handleSave = useCallback(async () => {
    await onSave()
  }, [onSave])

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onCancel()
    }
  }, [isSaving, onCancel])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={DIALOG_MAX_WIDTH}
        showCloseButton={!isSaving}
        onInteractOutside={(e) => {
          if (isSaving) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isSaving) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex gap-2 sm:gap-0'>
          <Button variant='outline' onClick={onCancel} disabled={isSaving}>
            {t('dontSave')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
