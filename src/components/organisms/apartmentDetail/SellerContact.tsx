import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
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
import BrokerAvatar from '@/components/molecules/brokerAvatar'
import { cn } from '@/lib/utils'

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
  const tCommon = useTranslations()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { openAuth } = useAuthDialog()

  const [showPhone, setShowPhone] = React.useState(false)
  const [openLoginRequired, setOpenLoginRequired] = React.useState(false)

  React.useEffect(() => {
    setShowPhone(false)
  }, [host?.userId, host?.phoneCode, host?.phoneNumber])

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
  const isProfessionalBroker =
    Boolean(host.isBroker) || host.brokerVerificationStatus === 'APPROVED'
  const professionalBrokerLabel = tCommon('userMenu.proBroker')

  return (
    <Card
      className={cn(
        'w-full shadow-lg hover:shadow-xl transition-shadow',
        isProfessionalBroker && 'border-2 border-[#22c55e]',
      )}
    >
      <CardContent className='p-4 md:p-4.5 space-y-3.5'>
        {/* Seller Info */}
        <div className='flex items-start gap-3'>
          <Link href={sellerListingsUrl} className='cursor-pointer'>
            <BrokerAvatar
              avatarUrl={avatarUrl}
              firstName={firstName}
              lastName={lastName}
              alt={name}
              sizeClassName='w-12 h-12 md:w-14 md:h-14'
              className='cursor-pointer'
              showBrokerBadge={isProfessionalBroker}
              fallbackClassName='text-sm md:text-base text-white'
              badgeClassName='h-5 w-5 md:h-6 md:w-6'
            />
          </Link>

          <div className='flex-1 min-w-0 flex flex-col gap-0.5'>
            {isProfessionalBroker && (
              <span className='inline-block text-xs md:text-sm font-semibold text-emerald-700 leading-tight'>
                {professionalBrokerLabel}
              </span>
            )}
            <Link
              href={sellerListingsUrl}
              className='cursor-pointer inline-block max-w-full'
            >
              <Typography
                variant='h5'
                className='font-bold truncate text-sm md:text-base hover:text-primary transition-colors cursor-pointer leading-tight'
              >
                {name}
              </Typography>
            </Link>
            <div className='pt-1'>
              <Button
                asChild
                size='sm'
                className='h-7 px-2.5 text-[11px] md:text-xs bg-primary hover:bg-primary/90 text-primary-foreground dark:text-white'
              >
                <Link href={sellerListingsUrl}>
                  {t('links.viewSellerListings')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className='space-y-2'>
          <Button
            className='w-full bg-white hover:bg-blue-50 text-foreground border-2 border-primary h-9 md:h-10 text-xs md:text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed dark:bg-primary dark:hover:bg-primary/90 dark:text-white dark:border-primary/80'
            onClick={handleZaloClick}
            disabled={!hasPhone}
            aria-label={t('actions.chatZalo')}
          >
            <Image
              src='/svg/zalo.svg'
              alt='Zalo'
              width={16}
              height={16}
              className='mr-1.5 w-4 h-4'
            />
            <span>{t('actions.chatZalo')}</span>
          </Button>

          <Button
            className='w-full bg-primary hover:bg-primary/90 h-9 md:h-10 text-xs md:text-sm font-semibold shadow-sm hover:shadow-md transition-all text-white dark:text-white'
            onClick={handleCall}
            disabled={!hasPhone}
            aria-label={showPhone ? phone : t('actions.showPhone')}
          >
            <Phone className='w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 text-white' />
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
