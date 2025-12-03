import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { ListingOwnerDetail } from '@/api/types'

export interface DeleteListingDialogProps {
  listing: ListingOwnerDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (listing: ListingOwnerDetail) => void
  isLoading?: boolean
}

export const DeleteListingDialog: React.FC<DeleteListingDialogProps> = ({
  listing,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const t = useTranslations('seller.listingManagement.card')

  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t('deleteConfirm.title')}</DialogTitle>
        <DialogDescription>{t('deleteConfirm.description')}</DialogDescription>
        <div className='flex gap-3 justify-end pt-4'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t('deleteConfirm.cancel')}
          </Button>
          <Button
            variant='destructive'
            disabled={isLoading}
            onClick={() => onConfirm(listing)}
          >
            {isLoading ? 'Deleting...' : t('deleteConfirm.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
