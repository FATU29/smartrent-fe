import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'

interface LoginRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  /** Optional overrides; default to the shared `contactAccess` copy. */
  title?: string
  description?: string
}

/**
 * Shared "you must log in first" confirmation used before any action that
 * would reveal a user's real contact details (phone / email / Zalo). Pairs
 * with the `useContactRevealGuard` hook, which owns the open/confirm state.
 */
const LoginRequiredDialog: React.FC<LoginRequiredDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}) => {
  const t = useTranslations('contactAccess')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[92vw] max-w-md p-5 sm:p-6'>
        <DialogHeader className='pb-2'>
          <DialogTitle>{title ?? t('loginRequiredTitle')}</DialogTitle>
          <DialogDescription>
            {description ?? t('loginRequiredDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='mt-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onConfirm}>{t('loginNow')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LoginRequiredDialog
