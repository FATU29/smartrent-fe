import { FC } from 'react'
import { useTranslations } from 'next-intl'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'

type TAiChatClearDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
}

const AiChatClearDialog: FC<TAiChatClearDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslations('aiChat')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('confirmClearTitle')}</DialogTitle>
          <DialogDescription>{t('confirmClearDescription')}</DialogDescription>
        </DialogHeader>

        <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            className='w-full sm:w-auto'
          >
            {t('confirmClearNo')}
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            className='w-full sm:w-auto'
          >
            {t('confirmClearYes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AiChatClearDialog
