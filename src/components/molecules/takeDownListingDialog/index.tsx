import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { ListingOwnerDetail } from '@/api/types'

const RISK_KEYS = ['risk1', 'risk2', 'risk3', 'risk4'] as const

export interface TakeDownListingDialogProps {
  listing: ListingOwnerDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (listing: ListingOwnerDetail) => void
  isLoading?: boolean
}

export const TakeDownListingDialog: React.FC<TakeDownListingDialogProps> = ({
  listing,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const t = useTranslations('seller.listingManagement.card.takeDownConfirm')

  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className='flex items-center gap-2 text-orange-600'>
          <AlertTriangle size={20} />
          {t('title')}
        </DialogTitle>
        <DialogDescription>{t('description')}</DialogDescription>

        <div className='mt-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-200'>
          <p className='font-medium mb-2'>{t('risksTitle')}</p>
          <ul className='list-disc pl-5 space-y-1'>
            {RISK_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>

        <div className='flex gap-3 justify-end pt-4'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => onConfirm(listing)}
            className='bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700'
          >
            {isLoading ? t('loading') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
