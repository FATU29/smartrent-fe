import React from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw, Calendar, CreditCard, Crown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
import { format, addDays } from 'date-fns'
import type { UserMembership } from '@/api/types/membership.type'

const RENEWAL_DAYS = 30

const formatDate = (date: Date): string => format(date, 'dd/MM/yyyy')

export interface RenewMembershipDialogProps {
  membership: UserMembership
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export const RenewMembershipDialog: React.FC<RenewMembershipDialogProps> = ({
  membership,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const t = useTranslations('seller.dashboard.membership.renewDialog')

  const currentExpiry = new Date(membership.endDate)
  const anchorDate = currentExpiry > new Date() ? currentExpiry : new Date()
  const newExpiry = addDays(anchorDate, RENEWAL_DAYS)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg p-0 overflow-hidden gap-0'>
        {/* Header */}
        <div className='bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground'>
          <DialogTitle asChild>
            <div className='flex items-center gap-2 text-base font-semibold'>
              <RefreshCw size={18} />
              {t('title')}
            </div>
          </DialogTitle>
          <DialogDescription className='text-primary-foreground/90 text-sm mt-1'>
            {t('description')}
          </DialogDescription>
        </div>

        <div className='px-6 py-5 space-y-4'>
          {/* Package info */}
          <div className='rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-3'>
            <div className='shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center'>
              <Crown size={18} className='text-primary' />
            </div>
            <div className='flex-1 min-w-0'>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t('currentPackage')}
              </Typography>
              <Typography
                variant='small'
                className='font-semibold mt-0.5 block'
              >
                {membership.packageName}
              </Typography>
              <Badge
                variant='outline'
                className='mt-1.5 text-xs font-medium border-primary/30 text-primary'
              >
                {membership.packageLevel}
              </Badge>
            </div>
          </div>

          {/* Expiry preview */}
          <section className='rounded-lg border border-primary/20 bg-primary/[0.04] p-4 space-y-3'>
            <div className='flex items-center gap-2'>
              <Calendar size={16} className='text-primary' />
              <Typography variant='small' className='font-semibold text-sm'>
                {t('preview.title')}
              </Typography>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Typography
                  variant='small'
                  className='text-xs text-muted-foreground'
                >
                  {t('preview.currentExpiry')}
                </Typography>
                <Typography
                  variant='small'
                  className='font-semibold mt-0.5 block'
                >
                  {formatDate(currentExpiry)}
                </Typography>
              </div>
              <div>
                <Typography
                  variant='small'
                  className='text-xs text-muted-foreground'
                >
                  {t('preview.newExpiry')}
                </Typography>
                <Typography
                  variant='small'
                  className='font-semibold mt-0.5 block text-primary'
                >
                  {formatDate(newExpiry)}
                </Typography>
              </div>
            </div>
          </section>

          {/* Payment notice */}
          <div className='flex items-start gap-2.5 rounded-lg bg-muted/60 p-3'>
            <CreditCard
              size={16}
              className='shrink-0 mt-0.5 text-muted-foreground'
            />
            <Typography
              variant='small'
              className='text-xs text-muted-foreground'
            >
              {t('paymentNotice')}
            </Typography>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-border bg-muted/20 px-6 py-4 flex gap-3 justify-end'>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            disabled={isLoading}
            onClick={onConfirm}
            className='min-w-[120px]'
          >
            {isLoading ? t('loading') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RenewMembershipDialog
