import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'
import CopyButton from '@/components/atoms/copy-button'
import { UserApi } from '@/api/types'
import { Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import BrokerAvatar from '@/components/molecules/brokerAvatar'
import FollowButton from '@/components/molecules/followButton'

interface SellerPublicProfileCardProps {
  seller?: UserApi | null
  isLoading?: boolean
}

interface ContactItem {
  key: string
  icon: React.ReactNode
  label: string
  masked: string
  copyText: string
  copySuccess: string
  actionHref: string
  actionIcon: React.ReactNode
  actionLabel: string
}

// Contact details are hidden on the UI — only their masked shape is shown and
// the real value is revealed by copying. Keep a visible hint of the value so
// the owner recognises it without exposing it to scrapers.
const maskPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return '•'.repeat(Math.max(digits.length, 3))
  return `${digits.slice(0, 3)}${'•'.repeat(Math.max(digits.length - 3, 4))}`
}

const maskEmail = (value: string): string => {
  const [name = '', domain = ''] = value.split('@')
  if (!domain) return '•'.repeat(5)
  return `${name.slice(0, 1)}${'•'.repeat(Math.max(name.length - 1, 3))}@${domain}`
}

const CONTACT_PILL_CLASSNAME =
  'flex items-center gap-2.5 text-sm rounded-lg border border-primary/25 p-2.5 bg-background/85 transition-colors hover:border-primary/45 w-full'

const SellerPublicProfileCard: React.FC<SellerPublicProfileCardProps> = ({
  seller,
  isLoading = false,
}) => {
  const t = useTranslations('sellerDetailPage')

  if (isLoading) {
    return (
      <Card className='border-primary/20 overflow-hidden bg-gradient-to-br from-background via-primary/[0.02] to-primary/[0.06] shadow-sm'>
        <CardHeader className='pb-3 space-y-2'>
          <Skeleton className='h-6 w-48' />
        </CardHeader>
        <CardContent className='space-y-4 pt-4'>
          <div className='flex items-start gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />

            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-6 w-52 max-w-full' />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 rounded-lg border border-primary/25 p-2.5 bg-background/85 w-full'>
              <Skeleton className='h-8 w-8 rounded-full shrink-0' />
              <Skeleton className='h-8 max-w-full flex-1' />
              <Skeleton className='h-8 w-8 rounded-md shrink-0' />
            </div>

            <div className='flex items-center gap-2 rounded-lg border border-primary/25 p-2.5 bg-background/85 w-full'>
              <Skeleton className='h-8 w-8 rounded-full shrink-0' />
              <Skeleton className='h-8 max-w-full flex-1' />
              <Skeleton className='h-8 w-8 rounded-md shrink-0' />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const firstName = seller?.firstName || ''
  const lastName = seller?.lastName || ''
  const displayName =
    `${firstName} ${lastName}`.trim() || t('profile.defaultSellerName')

  const phone =
    seller?.contactPhoneNumber ||
    `${seller?.phoneCode || ''} ${seller?.phoneNumber || ''}`.trim()

  const dialPhone = phone.replace(/\s+/g, '')
  const zaloPhone =
    `${seller?.phoneCode || ''}${seller?.phoneNumber || ''}`.replace(/\D/g, '')

  const hasPhone = Boolean(phone)
  const hasEmail = Boolean(seller?.email)
  const isProfessionalBroker =
    Boolean(seller?.isBroker) || seller?.brokerVerificationStatus === 'APPROVED'

  const contactItems: ContactItem[] = []
  if (hasPhone) {
    contactItems.push({
      key: 'phone',
      icon: <Phone className='h-4 w-4' />,
      label: t('profile.phoneLabel'),
      masked: maskPhoneNumber(phone),
      copyText: phone,
      copySuccess: t('profile.copiedPhone'),
      actionHref: `tel:${dialPhone}`,
      actionIcon: <Phone className='h-4 w-4' />,
      actionLabel: t('profile.actions.call'),
    })
  }
  if (hasEmail && seller?.email) {
    contactItems.push({
      key: 'email',
      icon: <Mail className='h-4 w-4' />,
      label: t('profile.emailLabel'),
      masked: maskEmail(seller.email),
      copyText: seller.email,
      copySuccess: t('profile.copiedEmail'),
      actionHref: `mailto:${seller.email}`,
      actionIcon: <Mail className='h-4 w-4' />,
      actionLabel: t('profile.actions.sendEmail'),
    })
  }

  return (
    <Card className='border-primary/20 overflow-hidden bg-gradient-to-br from-background via-primary/[0.02] to-primary/[0.06] shadow-sm'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg'>{t('profile.title')}</CardTitle>
        {seller?.userId && (
          <CardAction>
            <FollowButton
              targetUserId={seller.userId}
              iconOnly
              variant='outline'
              className='h-9 w-9 border-primary/40 text-primary hover:bg-primary/10'
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className='space-y-4 pt-4'>
        <div className='flex items-start gap-4'>
          <BrokerAvatar
            avatarUrl={seller?.avatarUrl}
            firstName={firstName}
            lastName={lastName}
            alt={displayName}
            sizeClassName='h-16 w-16 md:h-20 md:w-20'
            showBrokerBadge={isProfessionalBroker}
            fallbackClassName='text-base md:text-lg'
            badgeClassName='h-6 w-6 md:h-7 md:w-7'
          />

          <div className='min-w-0 flex-1 space-y-2'>
            <Typography variant='h4' className='truncate text-base md:text-lg'>
              {displayName}
            </Typography>
            {isProfessionalBroker && (
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className='gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                >
                  <ShieldCheck className='h-3.5 w-3.5' />
                  {t('profile.professionalBrokerBadge')}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Typography variant='small' className='font-medium text-foreground'>
            {t('profile.contactInformationTitle')}
          </Typography>

          {contactItems.length > 0 ? (
            <div className='flex flex-col gap-2'>
              {contactItems.map((item) => (
                <div key={item.key} className={CONTACT_PILL_CLASSNAME}>
                  <div className='h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                    {item.icon}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='small'
                      className='block leading-tight text-muted-foreground'
                    >
                      {item.label}
                    </Typography>
                    <span
                      aria-hidden='true'
                      className='block truncate font-medium tracking-wider text-foreground'
                    >
                      {item.masked}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 shrink-0'>
                    <Button
                      asChild
                      size='icon'
                      variant='ghost'
                      className='h-8 w-8 text-primary hover:bg-primary/10'
                    >
                      <a href={item.actionHref} aria-label={item.actionLabel}>
                        {item.actionIcon}
                      </a>
                    </Button>
                    <CopyButton
                      text={item.copyText}
                      successMessage={item.copySuccess}
                      className='h-8 w-8'
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography variant='small' className='text-muted-foreground'>
              {t('profile.contactNotAvailable')}
            </Typography>
          )}

          {zaloPhone && (
            <Button
              asChild
              variant='outline'
              className='w-full justify-center gap-2 border-primary/30 text-primary hover:bg-primary/10'
            >
              <a
                href={`https://zalo.me/${zaloPhone}`}
                target='_blank'
                rel='noreferrer'
              >
                <MessageCircle className='h-4 w-4' />
                {t('profile.actions.chatZalo')}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SellerPublicProfileCard
