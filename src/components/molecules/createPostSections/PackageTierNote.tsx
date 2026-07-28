import React from 'react'
import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/atoms/alert'
import { cn } from '@/lib/utils'
import type { VipTier } from '@/api/types/vip-tier.type'

interface PackageTierNoteProps {
  /** The currently selected VIP tier. Falls back to the general guidance
   *  note when absent, e.g. before tiers finish loading or while posting
   *  under a membership benefit (tier selection is locked in that case). */
  tier?: VipTier
  className?: string
}

const KNOWN_TIER_CODES = ['NORMAL', 'SILVER', 'GOLD', 'DIAMOND']

const PackageTierNote: React.FC<PackageTierNoteProps> = ({
  tier,
  className,
}) => {
  const t = useTranslations('createPost.sections.packageConfig.tierNotes')
  const tierCode = tier?.tierCode
  const resolvedKey =
    tierCode && KNOWN_TIER_CODES.includes(tierCode) ? tierCode : 'default'

  return (
    <Alert className={cn('bg-muted/40 border-border', className)}>
      <Info />
      <AlertDescription className='text-foreground'>
        {resolvedKey === 'default' ? (
          t('default')
        ) : (
          <>
            <strong className='font-semibold'>{tier?.tierName}</strong>{' '}
            {t(resolvedKey, { maxImages: tier?.maxImages ?? 0 })}
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}

export { PackageTierNote }
export type { PackageTierNoteProps }
