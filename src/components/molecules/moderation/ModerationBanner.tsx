import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { AlertTriangle, Info, Ban, Clock } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { ModerationStatus, PendingOwnerAction } from '@/api/types/property.type'

interface ModerationBannerProps {
  moderationStatus?: ModerationStatus
  verificationNotes?: string | null
  pendingOwnerAction?: PendingOwnerAction | null
  permanentlyRemoved?: boolean
  listingId: number
  onResubmit?: () => void
  className?: string
}

type NoteTone = 'severe' | 'warning' | 'muted'

const NOTE_BOX_TONE_CLASSES: Record<NoteTone, string> = {
  severe: 'border-red-200 bg-white/70 dark:border-red-900/50 dark:bg-black/20',
  warning:
    'border-orange-200 bg-white/70 dark:border-orange-900/50 dark:bg-black/20',
  muted: 'border-border bg-background/70',
}

const NOTE_BOX_LABEL_CLASSES: Record<NoteTone, string> = {
  severe: 'text-red-700 dark:text-red-400',
  warning: 'text-orange-700 dark:text-orange-400',
  muted: 'text-muted-foreground',
}

function NoteBox({
  label,
  text,
  tone,
}: {
  label: string
  text: string
  tone: NoteTone
}) {
  return (
    <div
      className={cn(
        'mb-2 rounded-lg border p-2.5',
        NOTE_BOX_TONE_CLASSES[tone],
      )}
    >
      <Typography
        variant='small'
        className={cn(
          'block text-xs font-semibold mb-0.5',
          NOTE_BOX_LABEL_CLASSES[tone],
        )}
      >
        {label}
      </Typography>
      <Typography variant='small' className='block text-foreground/80'>
        {text}
      </Typography>
    </div>
  )
}

function getDeadlineInfo(deadlineAt?: string | null) {
  if (!deadlineAt) return null

  const deadline = new Date(deadlineAt)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs <= 0) {
    return { expired: true, text: '', daysLeft: 0 }
  }

  return {
    expired: false,
    text: `${diffDays}`,
    daysLeft: diffDays,
    urgent: diffDays <= 1,
  }
}

export const ModerationBanner: React.FC<ModerationBannerProps> = ({
  moderationStatus,
  verificationNotes,
  pendingOwnerAction,
  permanentlyRemoved,
  listingId,
  className,
}) => {
  const t = useTranslations('seller.moderation.banner')
  const router = useRouter()

  if (
    !moderationStatus ||
    moderationStatus === ModerationStatus.APPROVED ||
    moderationStatus === ModerationStatus.PENDING_REVIEW
  ) {
    return null
  }

  const deadlineInfo = getDeadlineInfo(pendingOwnerAction?.deadlineAt)

  const handleEditAndResubmit = () => {
    router.push(`/seller/update-post/${listingId}?resubmit=true`)
  }

  const isOrdinarySuspend =
    moderationStatus === ModerationStatus.SUSPENDED && !permanentlyRemoved

  if (
    moderationStatus === ModerationStatus.REJECTED ||
    moderationStatus === ModerationStatus.REVISION_REQUIRED ||
    isOrdinarySuspend
  ) {
    const isSevere =
      moderationStatus === ModerationStatus.REJECTED || isOrdinarySuspend
    const title = isOrdinarySuspend
      ? t('suspendedTitle')
      : isSevere
        ? t('rejectedTitle')
        : t('revisionRequiredTitle')
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          isSevere
            ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
            : 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900',
          className,
        )}
      >
        <div className='flex items-start gap-3'>
          <AlertTriangle
            className={cn(
              'w-5 h-5 mt-0.5 shrink-0',
              isSevere
                ? 'text-red-600 dark:text-red-400'
                : 'text-orange-600 dark:text-orange-400',
            )}
          />
          <div className='flex-1 min-w-0'>
            <Typography
              variant='p'
              className={cn(
                'font-semibold mb-1',
                isSevere
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-orange-800 dark:text-orange-300',
              )}
            >
              {title}
            </Typography>

            {verificationNotes && (
              <NoteBox
                label={t('adminNoteLabel')}
                text={verificationNotes}
                tone={isSevere ? 'severe' : 'warning'}
              />
            )}

            {pendingOwnerAction?.notes && (
              <NoteBox
                label={t('adminNoteLabel')}
                text={pendingOwnerAction.notes}
                tone='muted'
              />
            )}

            {deadlineInfo && (
              <div className='flex items-center gap-1.5 mb-3'>
                <Clock
                  className={cn(
                    'w-3.5 h-3.5',
                    deadlineInfo.expired || deadlineInfo.urgent
                      ? 'text-red-500'
                      : 'text-muted-foreground',
                  )}
                />
                <Typography
                  variant='small'
                  className={cn(
                    'text-xs',
                    deadlineInfo.expired
                      ? 'text-red-600 font-semibold'
                      : deadlineInfo.urgent
                        ? 'text-red-500 font-medium'
                        : 'text-muted-foreground',
                  )}
                >
                  {deadlineInfo.expired
                    ? t('deadlineExpired')
                    : t('daysRemaining', { days: deadlineInfo.text })}
                </Typography>
              </div>
            )}

            <div className='flex flex-col sm:flex-row gap-2'>
              {!deadlineInfo?.expired && (
                <Button
                  size='sm'
                  variant={isSevere ? 'destructive' : 'default'}
                  onClick={handleEditAndResubmit}
                  className='text-xs w-full sm:w-auto'
                >
                  {t('editAndResubmit')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (moderationStatus === ModerationStatus.RESUBMITTED) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900',
          className,
        )}
      >
        <div className='flex items-start gap-3'>
          <Info className='w-5 h-5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400' />
          <div className='flex-1 min-w-0'>
            <Typography
              variant='p'
              className='font-semibold mb-1 text-blue-800 dark:text-blue-300'
            >
              {t('resubmittedTitle')}
            </Typography>
            <Typography
              variant='small'
              className='text-blue-700 dark:text-blue-400'
            >
              {t('resubmittedMessage')}
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  if (moderationStatus === ModerationStatus.SUSPENDED && permanentlyRemoved) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900',
          className,
        )}
      >
        <div className='flex items-start gap-3'>
          <Ban className='w-5 h-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400' />
          <div className='flex-1 min-w-0'>
            <Typography
              variant='p'
              className='font-semibold mb-1 text-red-800 dark:text-red-300'
            >
              {t('permanentlyRemovedTitle')}
            </Typography>
            {verificationNotes && (
              <NoteBox
                label={t('adminNoteLabel')}
                text={verificationNotes}
                tone='severe'
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
