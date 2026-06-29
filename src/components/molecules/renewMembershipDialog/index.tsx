import React from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw, Calendar, Check, Crown } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import type { UserMembership } from '@/api/types/membership.type'
import { PaymentProvider } from '@/api/types/membership.type'
import { formatCurrency } from '@/utils/payment/payment.utils'

const RENEWAL_DAYS = 30

const formatDate = (date: Date): string => format(date, 'dd/MM/yyyy')

const PROVIDER_OPTIONS = [
  {
    provider: PaymentProvider.SEPAY,
    logo: (
      <Image
        src='/images/sepay-logo.png'
        alt='SePay'
        width={40}
        height={40}
        className='object-contain w-10 h-10 rounded'
      />
    ),
    label: 'SePay',
  },
  {
    provider: PaymentProvider.ZALOPAY,
    logo: (
      <Image
        src='/images/zalopay-icon.png'
        alt='ZaloPay'
        width={40}
        height={40}
        className='object-contain bg-card p-1 w-10 h-10 rounded'
      />
    ),
    label: 'ZaloPay',
  },
]

export interface RenewMembershipDialogProps {
  membership: UserMembership
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (provider: PaymentProvider) => void
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
  const [selectedProvider, setSelectedProvider] =
    React.useState<PaymentProvider>(PaymentProvider.SEPAY)

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
          {/* Package info + price */}
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
            <div className='text-right shrink-0'>
              <Typography
                variant='small'
                className='text-xs text-muted-foreground'
              >
                {t('price')}
              </Typography>
              <Typography
                variant='small'
                className='font-bold text-sm text-foreground mt-0.5 block'
              >
                {formatCurrency(membership.packageSalePrice)}
              </Typography>
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

          {/* Payment provider selector */}
          <section className='space-y-2'>
            <Typography variant='small' className='font-semibold text-sm'>
              {t('paymentMethod')}
            </Typography>
            <div className='grid grid-cols-2 gap-2'>
              {PROVIDER_OPTIONS.map(({ provider, logo, label }) => (
                <button
                  key={provider}
                  type='button'
                  onClick={() => setSelectedProvider(provider)}
                  className={cn(
                    'relative flex items-center gap-2.5 p-3 rounded-lg border-2 transition-all hover:border-primary/50',
                    selectedProvider === provider
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background',
                  )}
                >
                  {logo}
                  <span className='text-sm font-medium text-foreground flex-1 text-left'>
                    {label}
                  </span>
                  {selectedProvider === provider && (
                    <Check size={16} className='shrink-0 text-primary' />
                  )}
                </button>
              ))}
            </div>
          </section>
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
            onClick={() => onConfirm(selectedProvider)}
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
