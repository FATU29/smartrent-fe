import React, { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Save } from 'lucide-react'
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
  onClose?: () => void
  isSaving?: boolean
}

const DIALOG_CONTAINER_CLASS =
  'w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden rounded-2xl border-0 p-0 shadow-2xl'

export const SaveDraftDialog: React.FC<SaveDraftDialogProps> = ({
  open,
  onSave,
  onCancel,
  onClose,
  isSaving = false,
}) => {
  const t = useTranslations('createPost.draftDialog')

  const handleSave = useCallback(async () => {
    await onSave()
  }, [onSave])

  const handleClose = useCallback(() => {
    if (!isSaving) {
      if (onClose) {
        onClose()
      } else {
        onCancel()
      }
    }
  }, [isSaving, onCancel, onClose])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={DIALOG_CONTAINER_CLASS}
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
        <div className='relative bg-background'>
          <div className='relative px-5 pt-5 pb-4 sm:px-5 sm:pt-6 sm:pb-5'>
            <div className='mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary'>
              <Save className='size-5' />
            </div>

            <DialogHeader className='gap-2 pb-0 text-left'>
              <DialogTitle className='text-xl leading-tight font-semibold'>
                {t('title')}
              </DialogTitle>
              <DialogDescription className='text-sm leading-6 text-muted-foreground'>
                {t('description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className='border-t px-5 py-4 sm:px-5 sm:py-5'>
            <Button
              variant='outline'
              onClick={onCancel}
              disabled={isSaving}
              className='w-full sm:w-auto sm:min-w-[128px]'
            >
              {t('dontSave')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className='w-full sm:w-auto sm:min-w-[160px]'
            >
              {isSaving ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
