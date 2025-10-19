import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/atoms/dialog'
import { Typography } from '@/components/atoms/typography'
import { PaymentProvider } from '@/api/types/memembership.type'
import { PaymentMethodOption } from './PaymentMethodOption'

interface PaymentMethodDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSelectMethod: (provider: PaymentProvider) => void
}

export const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({
  open,
  onOpenChange,
  onSelectMethod,
}) => {
  const t = useTranslations('paymentMethodDialog')
  const [selectedMethod, setSelectedMethod] = useState<PaymentProvider | null>(
    null,
  )

  const handleSelect = (provider: PaymentProvider) => {
    setSelectedMethod(provider)
    onSelectMethod(provider)
    onOpenChange(false)
    setSelectedMethod(null)
  }

  const paymentMethods = [
    {
      provider: PaymentProvider.VNPAY,
      label: t('vnpay'),
      logo: (
        <>
          <Image
            src='/images/vnpay-logo.png'
            alt='VNPAY'
            width={64}
            height={64}
            className='object-contain w-16 h-16 rounded-md'
          />
          <Typography
            as='div'
            className='hidden size-16 items-center justify-center bg-blue-600 text-white font-bold text-lg rounded-lg'
          >
            VN
          </Typography>
        </>
      ),
    },
    {
      provider: PaymentProvider.MOMO,
      label: t('momo'),
      logo: (
        <>
          <Image
            src='/images/momo-logo.png'
            alt='MoMo'
            width={64}
            height={64}
            className='object-contain w-16 h-16 rounded-md'
          />
          <Typography
            as='div'
            className='hidden size-16 items-center justify-center bg-pink-600 text-white font-bold text-lg rounded-lg'
          >
            MM
          </Typography>
        </>
      ),
    },
    {
      provider: PaymentProvider.PAYPAL,
      label: t('paypal'),
      logo: (
        <>
          <Image
            src='/images/paypal-logo.png'
            alt='PayPal'
            width={64}
            height={64}
            className='object-contain bg-white w-16 h-16 rounded-md'
          />
          <Typography
            as='div'
            className='hidden size-16 items-center justify-center bg-blue-500 text-white font-bold text-lg rounded-lg'
          >
            PP
          </Typography>
        </>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='size-full md:size-fit rounded-none'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Typography as='div' className='flex flex-col gap-3 py-4'>
          {paymentMethods.map((method) => (
            <PaymentMethodOption
              key={method.provider}
              provider={method.provider}
              label={method.label}
              logo={method.logo}
              selected={selectedMethod === method.provider}
              onSelect={handleSelect}
            />
          ))}
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentMethodDialog
