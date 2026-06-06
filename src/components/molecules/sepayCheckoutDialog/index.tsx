import React, { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/atoms/dialog'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { useTransactionPolling } from '@/hooks/usePayment'
import { PAYMENT_STATUS, SEPAY_CONFIG } from '@/constants/payment'
import { formatCurrency } from '@/utils/payment'
import type { SePayInitiationData } from '@/api/types/payment.type'
import { SePayBankDetails } from './SePayBankDetails'

type CheckoutView = 'pending' | 'success' | 'failed' | 'expired'

interface SePayCheckoutDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly data: SePayInitiationData | null
  /** Fired once when the transaction is confirmed COMPLETED. */
  readonly onCompleted?: () => void
}

const TERMINAL_FAILED = [
  PAYMENT_STATUS.FAILED,
  PAYMENT_STATUS.CANCELLED,
  PAYMENT_STATUS.REFUNDED,
] as string[]

/**
 * SePay (VietQR) checkout — renders the QR + bank details and polls the
 * transaction status until the backend webhook confirms the transfer. There is
 * no redirect; the screen flips to success in-place once the money lands.
 */
export const SePayCheckoutDialog: React.FC<SePayCheckoutDialogProps> = ({
  open,
  onOpenChange,
  data,
  onCompleted,
}) => {
  const t = useTranslations('sepayCheckout')
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  const expiresAtMs = useMemo(() => {
    if (!data) return null
    if (data.expiresAt) {
      const parsed = new Date(data.expiresAt).getTime()
      if (!Number.isNaN(parsed)) return parsed
    }
    return Date.now() + SEPAY_CONFIG.DEFAULT_EXPIRY_MS
  }, [data])

  const isExpired = secondsLeft !== null && secondsLeft <= 0

  const poll = useTransactionPolling(data?.transactionRef, {
    enabled: open && !!data?.transactionRef && !isExpired,
  })
  const status = poll.data?.status

  const view: CheckoutView = (() => {
    if (status === PAYMENT_STATUS.COMPLETED) return 'success'
    if (status && TERMINAL_FAILED.includes(status)) return 'failed'
    if (isExpired) return 'expired'
    return 'pending'
  })()

  // Notify the caller exactly once when the transfer is confirmed.
  useEffect(() => {
    if (view === 'success') onCompleted?.()
  }, [view])

  // Countdown ticker — only runs while the QR is on screen and still pending.
  useEffect(() => {
    if (!open || !expiresAtMs || view !== 'pending') return

    const tick = () => {
      setSecondsLeft(Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000)))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [open, expiresAtMs, view])

  // Reset the countdown whenever a fresh checkout opens.
  useEffect(() => {
    if (open) setSecondsLeft(null)
  }, [open, data?.transactionRef])

  const formattedAmount = formatCurrency(
    data?.amount ?? data?.providerData?.amount ?? 0,
    data?.currency ?? 'VND',
  )

  const countdownLabel = useMemo(() => {
    if (secondsLeft === null) return ''
    const mins = Math.floor(secondsLeft / 60)
    const secs = secondsLeft % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [secondsLeft])

  const renderPending = () => (
    <div className='flex flex-col gap-4'>
      <Typography as='p' className='text-sm text-muted-foreground text-center'>
        {t('scanInstruction')}
      </Typography>

      {data?.qrCodeData && (
        <div className='flex justify-center'>
          <div className='rounded-xl border border-border bg-card p-3'>
            {/* eslint-disable-next-line @next/next/no-img-element -- external VietQR served by qr.sepay.vn; must not be proxied/optimized */}
            <img
              src={data.qrCodeData}
              alt={t('qrAlt')}
              width={224}
              height={224}
              className='size-56 object-contain'
            />
          </div>
        </div>
      )}

      <SePayBankDetails
        providerData={data?.providerData}
        formattedAmount={formattedAmount}
      />

      <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='size-4 animate-spin' />
        <span>{t('waiting')}</span>
        {secondsLeft !== null && (
          <span className='inline-flex items-center gap-1 text-foreground font-medium'>
            <Clock className='size-3.5' />
            {countdownLabel}
          </span>
        )}
      </div>
    </div>
  )

  const renderResult = (
    icon: React.ReactNode,
    title: string,
    message: string,
  ) => (
    <div className='flex flex-col items-center gap-3 py-6 text-center'>
      {icon}
      <Typography variant='h3' className='text-foreground'>
        {title}
      </Typography>
      <Typography as='p' className='text-sm text-muted-foreground'>
        {message}
      </Typography>
      <Button className='mt-2' onClick={() => onOpenChange(false)}>
        {t('close')}
      </Button>
    </div>
  )

  const renderBody = () => {
    if (view === 'success') {
      return renderResult(
        <CheckCircle2 className='size-14 text-green-600 dark:text-green-400' />,
        t('success.title'),
        t('success.message'),
      )
    }
    if (view === 'failed') {
      return renderResult(
        <XCircle className='size-14 text-destructive' />,
        t('failed.title'),
        t('failed.message'),
      )
    }
    if (view === 'expired') {
      return renderResult(
        <Clock className='size-14 text-amber-500' />,
        t('expired.title'),
        t('expired.message'),
      )
    }
    return renderPending()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        {renderBody()}
      </DialogContent>
    </Dialog>
  )
}

export default SePayCheckoutDialog
