import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
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
import { Mail, Phone, UserRoundCheck } from 'lucide-react'

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

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg'>{t('profile.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-start gap-4'>
          <Avatar className='h-14 w-14 ring-2 ring-primary/15'>
            <AvatarImage src={seller?.avatarUrl} alt={displayName} />
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
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
              <Badge variant='outline'>
                {t('profile.listingCount', { count: listingCount })}
              </Badge>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          {phone && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Phone className='h-4 w-4 text-primary' />
              <span className='truncate'>{phone}</span>
              <CopyButton
                text={phone}
                successMessage={t('profile.copiedPhone')}
                className='h-6 w-6'
              />
            </div>
          )}

          {seller?.email && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Mail className='h-4 w-4 text-primary' />
              <span className='truncate'>{seller.email}</span>
              <CopyButton
                text={seller.email}
                successMessage={t('profile.copiedEmail')}
                className='h-6 w-6'
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SellerPublicProfileCard
