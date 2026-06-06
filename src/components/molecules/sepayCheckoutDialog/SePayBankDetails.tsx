import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import type { SePayProviderData } from '@/api/types/payment.type'

interface CopyableRowProps {
  readonly label: string
  readonly value: string
  readonly highlight?: boolean
}

const CopyableRow: React.FC<CopyableRowProps> = ({
  label,
  value,
  highlight = false,
}) => {
  const t = useTranslations('sepayCheckout')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable — the value is still visible to copy manually.
    }
  }

  return (
    <div className='flex items-center justify-between gap-3 py-2'>
      <Typography as='span' className='text-sm text-muted-foreground'>
        {label}
      </Typography>
      <div className='flex items-center gap-2 min-w-0'>
        <Typography
          as='span'
          className={cn(
            'text-sm font-semibold text-foreground truncate',
            highlight && 'text-primary',
          )}
        >
          {value}
        </Typography>
        <button
          type='button'
          onClick={handleCopy}
          aria-label={copied ? t('copied') : t('copy')}
          className='shrink-0 text-muted-foreground hover:text-primary transition-colors'
        >
          {copied ? (
            <Check className='size-4 text-primary' />
          ) : (
            <Copy className='size-4' />
          )}
        </button>
      </div>
    </div>
  )
}

interface SePayBankDetailsProps {
  readonly providerData?: SePayProviderData
  readonly formattedAmount: string
}

/**
 * Manual bank-transfer details for users who cannot scan the VietQR.
 * The transfer content is the critical field — the backend matches the payment
 * by it, so it is highlighted with a keep-exact warning.
 */
export const SePayBankDetails: React.FC<SePayBankDetailsProps> = ({
  providerData,
  formattedAmount,
}) => {
  const t = useTranslations('sepayCheckout')

  if (!providerData) return null

  return (
    <div className='rounded-lg border border-border bg-muted/30 p-4'>
      <Typography as='p' className='text-sm font-medium text-foreground mb-1'>
        {t('manualInstruction')}
      </Typography>
      <div className='divide-y divide-border'>
        {providerData.bankCode && (
          <CopyableRow label={t('bank')} value={providerData.bankCode} />
        )}
        {providerData.accountNumber && (
          <CopyableRow
            label={t('accountNumber')}
            value={providerData.accountNumber}
          />
        )}
        {providerData.accountName && (
          <CopyableRow
            label={t('accountName')}
            value={providerData.accountName}
          />
        )}
        <CopyableRow label={t('amount')} value={formattedAmount} />
        {providerData.transferContent && (
          <CopyableRow
            label={t('transferContent')}
            value={providerData.transferContent}
            highlight
          />
        )}
      </div>
      <Typography
        as='p'
        className='text-xs text-destructive mt-2 leading-relaxed'
      >
        {t('transferContentWarning')}
      </Typography>
    </div>
  )
}

export default SePayBankDetails
