import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Textarea } from '@/components/atoms/textarea'
import { Label } from '@/components/atoms/label'
import { ListingOwnerDetail } from '@/api/types'
import { Loader2 } from 'lucide-react'

interface ResubmitListingDialogProps {
  listing: ListingOwnerDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (listing: ListingOwnerDetail, notes?: string) => void
  isLoading?: boolean
}

export const ResubmitListingDialog: React.FC<ResubmitListingDialogProps> = ({
  listing,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const t = useTranslations('seller.moderation.resubmit')
  const [notes, setNotes] = useState('')

  const handleConfirm = () => {
    if (!listing) return
    onConfirm(listing, notes.trim() || undefined)
    setNotes('')
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setNotes('')
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>{t('dialogDescription')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {listing?.verificationNotes && (
            <div className='rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900 p-3'>
              <p className='text-sm text-orange-700 dark:text-orange-400'>
                {listing.verificationNotes}
              </p>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='resubmit-notes'>{t('notesLabel')}</Label>
            <Textarea
              id='resubmit-notes'
              placeholder={t('notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
