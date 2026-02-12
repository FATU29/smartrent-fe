import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { AlertTriangle, Info, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'
import { ModerationStatus, PendingOwnerAction } from '@/api/types/property.type'

interface ModerationBannerProps {
  moderationStatus?: ModerationStatus
  verificationNotes?: string | null
  pendingOwnerAction?: PendingOwnerAction | null
  listingId: number
  onResubmit?: () => void
  className?: string
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
  listingId,
  onResubmit,
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

  if (
    moderationStatus === ModerationStatus.REJECTED ||
    moderationStatus === ModerationStatus.REVISION_REQUIRED
  ) {
    const isRejected = moderationStatus === ModerationStatus.REJECTED
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          isRejected
            ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
            : 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900',
          className,
        )}
      >
        <div className='flex items-start gap-3'>
          <AlertTriangle
            className={cn(
              'w-5 h-5 mt-0.5 shrink-0',
              isRejected
                ? 'text-red-600 dark:text-red-400'
                : 'text-orange-600 dark:text-orange-400',
            )}
          />
          <div className='flex-1 min-w-0'>
            <Typography
              variant='p'
              className={cn(
                'font-semibold mb-1',
                isRejected
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-orange-800 dark:text-orange-300',
              )}
            >
              {isRejected ? t('rejectedTitle') : t('revisionRequiredTitle')}
            </Typography>

            {verificationNotes && (
              <Typography
                variant='small'
                className={cn(
                  'block mb-2',
                  isRejected
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-orange-700 dark:text-orange-400',
                )}
              >
                {verificationNotes}
              </Typography>
            )}

            {pendingOwnerAction?.notes && (
              <Typography
                variant='small'
                className='block mb-2 text-muted-foreground'
              >
                {pendingOwnerAction.notes}
              </Typography>
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

            <div className='flex gap-2'>
              {!deadlineInfo?.expired && (
                <Button
                  size='sm'
                  variant={isRejected ? 'destructive' : 'default'}
                  onClick={handleEditAndResubmit}
                  className='text-xs'
                >
                  {t('editAndResubmit')}
                </Button>
              )}
              {onResubmit && !deadlineInfo?.expired && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={onResubmit}
                  className='text-xs'
                >
                  {t('resubmitDirectly')}
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

  if (moderationStatus === ModerationStatus.SUSPENDED) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 bg-gray-50 border-gray-300 dark:bg-gray-950/30 dark:border-gray-700',
          className,
        )}
      >
        <div className='flex items-start gap-3'>
          <XCircle className='w-5 h-5 mt-0.5 shrink-0 text-gray-600 dark:text-gray-400' />
          <div className='flex-1 min-w-0'>
            <Typography
              variant='p'
              className='font-semibold mb-1 text-gray-800 dark:text-gray-300'
            >
              {t('suspendedTitle')}
            </Typography>
            {verificationNotes && (
              <Typography
                variant='small'
                className='block mb-2 text-gray-700 dark:text-gray-400'
              >
                {verificationNotes}
              </Typography>
            )}
            <Button size='sm' variant='outline' className='text-xs'>
              {t('contactSupport')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
