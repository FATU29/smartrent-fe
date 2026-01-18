import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Avatar } from '@/components/atoms/avatar'
import { Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PUBLIC_ROUTES } from '@/constants/route'
import { UserApi } from '@/api/types'

interface SellerContactProps {
  host?: UserApi
  onChatZalo?: () => void
  onPhoneClick?: () => void
}

const SellerContact: React.FC<SellerContactProps> = ({
  host,
  onChatZalo,
  onPhoneClick,
}) => {
  const t = useTranslations('apartmentDetail')

  const [showPhone, setShowPhone] = React.useState(false)

  if (!host) {
    return null
  }

  const {
    firstName = '',
    lastName = '',
    phoneCode = '',
    phoneNumber = '',
    avatarUrl,
  } = host
  const name = `${firstName} ${lastName}`.trim() || 'Người bán'
  const phone = `${phoneCode} ${phoneNumber}`.trim()
  const zaloLink = phone ? `https://zalo.me/${phoneCode}${phoneNumber}` : ''
  const sellerListingsUrl = `${PUBLIC_ROUTES.PROPERTIES_PREFIX}?userId=${encodeURIComponent(
    host.userId || '',
  )}`

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleZaloClick = () => {
    if (zaloLink) {
      window.open(zaloLink, '_blank')
    }
    onChatZalo?.()
  }

  const handleCall = () => {
    setShowPhone(true)
    onPhoneClick?.()
  }

  return (
    <Card className='w-full shadow-lg hover:shadow-xl transition-shadow'>
      <CardContent className='p-5 md:p-6 space-y-5'>
        {/* Seller Info */}
        <div className='flex items-start gap-4'>
          <Avatar className='w-14 h-14 md:w-16 md:h-16 flex-shrink-0 ring-2 ring-primary/10'>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={64}
                height={64}
                className='object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-lg md:text-xl font-bold'>
                {getInitials(name)}
              </div>
            )}
          </Avatar>

          <div className='flex-1 min-w-0'>
            <Typography
              variant='h5'
              className='font-bold mb-2 truncate text-basemd:text-lg '
            >
              {name}
            </Typography>
            <Typography variant='small' className='text-primary'>
              <Link
                href={sellerListingsUrl}
                className='hover:underline inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary/80'
              >
                {t('links.viewSellerListings')}
                <svg
                  className='w-3.5 h-3.5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </Link>
            </Typography>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className='space-y-2.5'>
          <Button
            className='w-full bg-white hover:bg-blue-50 text-foreground border-2 border-primary h-11 md:h-12 font-semibold shadow-sm hover:shadow-md transition-all'
            onClick={handleZaloClick}
          >
            <Image
              src='/svg/zalo.svg'
              alt='Zalo'
              width={20}
              height={20}
              className='mr-2 w-5 h-5'
            />
            <p className='text-black'>{t('actions.chatZalo')}</p>
          </Button>

          <Button
            className='w-full bg-primary hover:bg-primary/90 h-11 md:h-12 font-semibold shadow-sm hover:shadow-md transition-all'
            onClick={handleCall}
          >
            <Phone className='w-4 h-4 md:w-5 md:h-5 mr-2' />
            {showPhone ? phone : t('actions.showPhone')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SellerContact
