import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'
import CopyButton from '@/components/atoms/copy-button'
import { UserApi } from '@/api/types'
import {
  BadgeCheck,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react'

interface SellerPublicProfileCardProps {
  seller?: UserApi | null
  listingCount: number
  isLoading?: boolean
}

const getInitials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const SellerPublicProfileCard: React.FC<SellerPublicProfileCardProps> = ({
  seller,
  listingCount,
  isLoading = false,
}) => {
  const t = useTranslations('sellerDetailPage')

  if (isLoading) {
    return (
      <Card className='border-primary/20 overflow-hidden bg-gradient-to-br from-background via-primary/[0.02] to-primary/[0.06] shadow-sm'>
        <CardHeader className='pb-3 space-y-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-72 max-w-full' />
        </CardHeader>
        <CardContent className='space-y-4 pt-4'>
          <div className='flex items-start gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />

            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-6 w-52 max-w-full' />
              <div className='flex flex-wrap items-center gap-2'>
                <Skeleton className='h-6 w-28 rounded-full' />
                <Skeleton className='h-6 w-24 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
            <Skeleton className='h-10 w-full rounded-md' />
            <Skeleton className='h-10 w-full rounded-md' />
            <Skeleton className='h-10 w-full rounded-md sm:col-span-2 lg:col-span-1' />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
            <div className='flex items-center gap-2 rounded-lg border border-primary/25 p-2.5 bg-background/85'>
              <Skeleton className='h-8 w-8 rounded-full shrink-0' />
              <Skeleton className='h-4 w-40 max-w-full flex-1' />
              <Skeleton className='h-8 w-8 rounded-md shrink-0' />
            </div>

            <div className='flex items-center gap-2 rounded-lg border border-primary/25 p-2.5 bg-background/85'>
              <Skeleton className='h-8 w-8 rounded-full shrink-0' />
              <Skeleton className='h-4 w-56 max-w-full flex-1' />
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

  return (
    <Card className='border-primary/20 overflow-hidden bg-gradient-to-br from-background via-primary/[0.02] to-primary/[0.06] shadow-sm'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg'>{t('profile.title')}</CardTitle>
        <Typography variant='small' className='text-muted-foreground mt-1'>
          {t('profile.subtitle')}
        </Typography>
      </CardHeader>
      <CardContent className='space-y-4 pt-4'>
        <div className='flex items-start gap-4'>
          <Avatar className='h-16 w-16 ring-2 ring-primary/15'>
            <AvatarImage src={seller?.avatarUrl} alt={displayName} />
            <AvatarFallback className='bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold'>
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1 space-y-2'>
            <Typography variant='h4' className='truncate text-base md:text-lg'>
              {displayName}
            </Typography>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='secondary' className='gap-1.5'>
                <UserRoundCheck className='h-3.5 w-3.5' />
                {t('profile.sellerBadge')}
              </Badge>

              {isProfessionalBroker && (
                <Badge
                  variant='outline'
                  className='gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                >
                  <ShieldCheck className='h-3.5 w-3.5' />
                  {t('profile.professionalBrokerBadge')}
                </Badge>
              )}

              {seller?.contactPhoneVerified && (
                <Badge
                  variant='outline'
                  className='gap-1.5 border-emerald-500/30 text-emerald-700'
                >
                  <BadgeCheck className='h-3.5 w-3.5' />
                  {t('profile.contactVerified')}
                </Badge>
              )}
              <Badge variant='outline'>
                {t('profile.listingCount', { count: listingCount })}
              </Badge>
            </div>

            {isProfessionalBroker && (
              <Typography
                variant='small'
                className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50/60 px-2.5 py-1 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/20 dark:text-emerald-300'
              >
                <ShieldCheck className='h-3.5 w-3.5' />
                {t('profile.professionalBrokerDescription')}
              </Typography>
            )}
          </div>
        </div>

        {(hasPhone || hasEmail) && (
          <div className='space-y-2'>
            <Typography variant='small' className='font-medium text-foreground'>
              {t('profile.quickActionsTitle')}
            </Typography>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
              {hasPhone && (
                <Button
                  asChild
                  variant='outline'
                  className='justify-start bg-background/90 hover:bg-primary/10 border-primary/30 hover:border-primary/45'
                >
                  <a href={`tel:${dialPhone}`}>
                    <Phone className='h-4 w-4' />
                    {t('profile.actions.call')}
                  </a>
                </Button>
              )}

              {zaloPhone && (
                <Button
                  asChild
                  variant='outline'
                  className='justify-start bg-background/90 hover:bg-primary/10 border-primary/30 hover:border-primary/45'
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

              {hasEmail && (
                <Button
                  asChild
                  variant='outline'
                  className='justify-start bg-background/90 hover:bg-primary/10 border-primary/30 hover:border-primary/45'
                >
                  <a href={`mailto:${seller?.email}`}>
                    <Mail className='h-4 w-4' />
                    {t('profile.actions.sendEmail')}
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <Typography variant='small' className='font-medium text-foreground'>
            {t('profile.contactInformationTitle')}
          </Typography>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
            {phone && (
              <div className='flex items-center gap-2.5 text-sm rounded-lg border border-primary/25 p-2.5 bg-background/85 transition-colors hover:border-primary/45'>
                <div className='h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                  <Phone className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1 flex items-center gap-1.5'>
                  <Typography
                    variant='small'
                    className='text-muted-foreground whitespace-nowrap'
                  >
                    {t('profile.phoneLabel')}:
                  </Typography>
                  <a
                    href={`tel:${dialPhone}`}
                    className='truncate font-medium transition-colors hover:text-primary'
                    title={phone}
                  >
                    {phone}
                  </a>
                </div>
                <CopyButton
                  text={phone}
                  successMessage={t('profile.copiedPhone')}
                  className='h-8 w-8'
                />
              </div>
            )}

            {seller?.email && (
              <div className='flex items-center gap-2.5 text-sm rounded-lg border border-primary/25 p-2.5 bg-background/85 transition-colors hover:border-primary/45'>
                <div className='h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                  <Mail className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1 flex items-center gap-1.5'>
                  <Typography
                    variant='small'
                    className='text-muted-foreground whitespace-nowrap'
                  >
                    {t('profile.emailLabel')}:
                  </Typography>
                  <a
                    href={`mailto:${seller.email}`}
                    className='truncate font-medium transition-colors hover:text-primary'
                    title={seller.email}
                  >
                    {seller.email}
                  </a>
                </div>
                <CopyButton
                  text={seller.email}
                  successMessage={t('profile.copiedEmail')}
                  className='h-8 w-8'
                />
              </div>
            )}
          </div>

          {!phone && !seller?.email && (
            <Typography variant='small' className='text-muted-foreground'>
              {t('profile.contactNotAvailable')}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SellerPublicProfileCard
