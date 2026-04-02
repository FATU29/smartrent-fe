import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Avatar } from '@/components/atoms/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PUBLIC_ROUTES, buildSellerDetailRoute } from '@/constants/route'
import { UserApi } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'
import { useAuthDialog } from '@/contexts/authDialog'

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
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { openAuth } = useAuthDialog()

  const [showPhone, setShowPhone] = React.useState(false)
  const [openLoginRequired, setOpenLoginRequired] = React.useState(false)

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
  const sellerListingsUrl = host.userId
    ? buildSellerDetailRoute(host.userId)
    : PUBLIC_ROUTES.PROPERTIES_PREFIX

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
    if (!isAuthenticated) {
      setOpenLoginRequired(true)
      return
    }

    setShowPhone(true)
    onPhoneClick?.()
  }

  const handleLoginToViewPhone = () => {
    setOpenLoginRequired(false)
    openAuth('login', router.asPath)
  }

  const hasPhone = Boolean(phoneCode && phoneNumber)

  return (
    <Card className='w-full shadow-lg hover:shadow-xl transition-shadow'>
      <CardContent className='p-5 md:p-6 space-y-4.5'>
        {/* Seller Info */}
        <div className='flex items-start gap-4'>
          <Link href={sellerListingsUrl} className='cursor-pointer'>
            <Avatar className='w-14 h-14 md:w-16 md:h-16 flex-shrink-0 ring-2 ring-primary/10 cursor-pointer'>
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
          </Link>

          <div className='flex-1 min-w-0 flex flex-col gap-1'>
            <Link
              href={sellerListingsUrl}
              className='cursor-pointer inline-block max-w-full'
            >
              <Typography
                variant='h5'
                className='font-bold truncate text-base md:text-lg hover:text-primary transition-colors cursor-pointer leading-tight'
              >
                {name}
              </Typography>
            </Link>
            <Typography variant='small' className='text-primary leading-none'>
              <Link
                href={sellerListingsUrl}
                className='hover:underline inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary/80'
              >
                {t('links.viewSellerListings')}
                <svg
                  className='w-3.5 h-3.5 shrink-0'
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
            className='w-full bg-white hover:bg-blue-50 text-foreground border-2 border-primary h-11 md:h-12 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed'
            onClick={handleZaloClick}
            disabled={!hasPhone}
            aria-label={t('actions.chatZalo')}
          >
            <Image
              src='/svg/zalo.svg'
              alt='Zalo'
              width={20}
              height={20}
              className='mr-2 w-5 h-5'
            />
            <span className='text-black'>{t('actions.chatZalo')}</span>
          </Button>

          <Button
            className='w-full bg-primary hover:bg-primary/90 h-11 md:h-12 font-semibold shadow-sm hover:shadow-md transition-all'
            onClick={handleCall}
            disabled={!hasPhone}
            aria-label={showPhone ? phone : t('actions.showPhone')}
          >
            <Phone className='w-4 h-4 md:w-5 md:h-5 mr-2' />
            {showPhone ? phone : t('actions.showPhone')}
          </Button>
        </div>
      </CardContent>

      <Dialog open={openLoginRequired} onOpenChange={setOpenLoginRequired}>
        <DialogContent className='w-[92vw] max-w-md p-5 sm:p-6'>
          <DialogHeader className='pb-2'>
            <DialogTitle>{t('phoneAccess.loginRequiredTitle')}</DialogTitle>
            <DialogDescription>
              {t('phoneAccess.loginRequiredDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-2'>
            <Button
              variant='outline'
              onClick={() => setOpenLoginRequired(false)}
            >
              {t('phoneAccess.cancel')}
            </Button>
            <Button onClick={handleLoginToViewPhone}>
              {t('phoneAccess.loginNow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default SellerContact
