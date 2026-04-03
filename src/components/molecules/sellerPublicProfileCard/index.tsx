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
import { Typography } from '@/components/atoms/typography'
import CopyButton from '@/components/atoms/copy-button'
import { UserApi } from '@/api/types'
import {
  BadgeCheck,
  Mail,
  MessageCircle,
  Phone,
  UserRoundCheck,
} from 'lucide-react'

interface SellerPublicProfileCardProps {
  seller?: UserApi | null
  listingCount: number
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
}) => {
  const t = useTranslations('sellerDetailPage')

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
          </div>
        </div>

        {(hasPhone || hasEmail) && (
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
        )}

        <div className='space-y-2'>
          {phone && (
            <div className='flex items-center gap-2 text-sm rounded-lg border border-primary/25 p-2.5 bg-background/85'>
              <Phone className='h-4 w-4 text-primary shrink-0' />
              <div className='min-w-0 flex-1'>
                <Typography variant='small' className='text-muted-foreground'>
                  {t('profile.phoneLabel')}
                </Typography>
                <span className='truncate block'>{phone}</span>
              </div>
              <CopyButton
                text={phone}
                successMessage={t('profile.copiedPhone')}
                className='h-7 w-7'
              />
            </div>
          )}

          {seller?.email && (
            <div className='flex items-center gap-2 text-sm rounded-lg border border-primary/25 p-2.5 bg-background/85'>
              <Mail className='h-4 w-4 text-primary shrink-0' />
              <div className='min-w-0 flex-1'>
                <Typography variant='small' className='text-muted-foreground'>
                  {t('profile.emailLabel')}
                </Typography>
                <span className='truncate block'>{seller.email}</span>
              </div>
              <CopyButton
                text={seller.email}
                successMessage={t('profile.copiedEmail')}
                className='h-7 w-7'
              />
            </div>
          )}

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
