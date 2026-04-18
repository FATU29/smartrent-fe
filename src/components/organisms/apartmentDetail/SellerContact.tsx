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
import { ChevronRight, Phone } from 'lucide-react'
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
        isProfessionalBroker &&
          'overflow-hidden border-[3px] border-[#22c55e] rounded-[26px] py-0 bg-[#f6f9f9]',
      )}
    >
      {isProfessionalBroker && (
        <div className='bg-[#22c55e] px-5 py-4 text-center'>
          <Typography className='text-white text-2xl font-semibold leading-tight'>
            {professionalBrokerLabel}
          </Typography>
        </div>
      )}

      <CardContent
        className={cn(
          'space-y-4.5',
          isProfessionalBroker ? 'p-3 md:p-4' : 'p-5 md:p-6',
        )}
      >
        <div
          className={cn(
            isProfessionalBroker &&
              'rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm',
          )}
        >
          {/* Seller Info */}
          <div className='flex items-start gap-4'>
            <Link href={sellerListingsUrl} className='cursor-pointer'>
              <BrokerAvatar
                avatarUrl={avatarUrl}
                firstName={firstName}
                lastName={lastName}
                alt={name}
                sizeClassName={
                  isProfessionalBroker
                    ? 'w-20 h-20 md:w-24 md:h-24'
                    : 'w-16 h-16 md:w-20 md:h-20'
                }
                className='cursor-pointer'
                showBrokerBadge={isProfessionalBroker}
                fallbackClassName='text-lg md:text-xl text-white'
                badgeClassName={
                  isProfessionalBroker
                    ? 'h-7 w-7 md:h-8 md:w-8'
                    : 'h-6 w-6 md:h-7 md:w-7'
                }
              />
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
              {!isProfessionalBroker && (
                <div className='pt-1'>
                  <Button
                    asChild
                    size='sm'
                    className='h-8 px-3 text-xs md:text-sm bg-primary hover:bg-primary/90 text-primary-foreground dark:text-white'
                  >
                    <Link href={sellerListingsUrl}>
                      {t('links.viewSellerListings')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {isProfessionalBroker && (
            <div className='mt-4'>
              <Link
                href={sellerListingsUrl}
                className='inline-flex w-full items-center justify-center gap-1.5 text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors'
              >
                <span>{t('links.viewSellerListings')}</span>
                <ChevronRight className='h-5 w-5' />
              </Link>
            </div>
          )}

          {/* Contact Buttons */}
          <div
            className={cn(
              'space-y-2.5',
              isProfessionalBroker &&
                'mt-4 pt-4 border-t border-slate-200 space-y-3',
            )}
          >
            <Button
              className={cn(
                'w-full h-11 md:h-12 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed',
                isProfessionalBroker
                  ? 'bg-white hover:bg-slate-50 text-foreground border border-slate-300 shadow-none rounded-2xl'
                  : 'bg-white hover:bg-blue-50 text-foreground border-2 border-primary shadow-sm hover:shadow-md dark:bg-primary dark:hover:bg-primary/90 dark:text-white dark:border-primary/80',
              )}
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
              <span>{t('actions.chatZalo')}</span>
            </Button>

            <Button
              className={cn(
                'w-full h-11 md:h-12 font-semibold transition-all text-white dark:text-white',
                isProfessionalBroker
                  ? 'bg-[#22c55e] hover:bg-[#16a34a] shadow-none rounded-2xl'
                  : 'bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md',
              )}
              onClick={handleCall}
              disabled={!hasPhone}
              aria-label={showPhone ? phone : t('actions.showPhone')}
            >
              <Phone className='w-4 h-4 md:w-5 md:h-5 mr-2 text-white' />
              {showPhone ? phone : t('actions.showPhone')}
            </Button>
          </div>
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
