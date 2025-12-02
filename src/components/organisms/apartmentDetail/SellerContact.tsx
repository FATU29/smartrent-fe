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
    avatar,
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
    <Card className='w-full'>
      <CardContent className='p-6 space-y-6'>
        {/* Seller Info */}
        <div className='flex items-start gap-4'>
          <Avatar className='w-14 h-14 flex-shrink-0'>
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={56}
                height={56}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-lg font-bold'>
                {getInitials(name)}
              </div>
            )}
          </Avatar>

          <div className='flex-1 min-w-0'>
            <Typography variant='h5' className='font-bold mb-1 truncate'>
              {name}
            </Typography>
            {/* Link to user's listings page */}
            <Typography variant='small' className='text-primary'>
              <Link href={sellerListingsUrl} className='hover:underline'>
                {t('links.viewSellerListings')}
              </Link>
            </Typography>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className='space-y-3'>
          <Button
            className='w-full bg-white text-black border-2 border-primary h-12 font-semibold'
            onClick={handleZaloClick}
          >
            <Image
              src='/svg/zalo.svg'
              alt='Zalo'
              width={24}
              height={24}
              className='mr-2'
              color='white'
            />
            {t('actions.chatZalo')}
          </Button>

          <Button
            className='w-full bg-primary h-12 font-semibold'
            onClick={handleCall}
          >
            <Phone className='w-5 h-5 mr-2' />
            {showPhone ? phone : t('actions.showPhone')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SellerContact
