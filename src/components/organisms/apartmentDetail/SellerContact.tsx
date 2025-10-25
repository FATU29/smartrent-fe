import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Avatar } from '@/components/atoms/avatar'
import { Phone, ChevronRight, Sparkles } from 'lucide-react'
import type { HostInfo } from '@/types/apartmentDetail.types'
import Image from 'next/image'

interface SellerContactProps {
  host: HostInfo
  onCall?: () => void
  onChatZalo?: () => void
}

const SellerContact: React.FC<SellerContactProps> = ({
  host,
  onCall,
  onChatZalo,
}) => {
  const t = useTranslations('apartmentDetail')

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleZaloClick = () => {
    if (host.zaloLink) {
      window.open(host.zaloLink, '_blank')
    }
    onChatZalo?.()
  }

  return (
    <Card className='sticky top-4'>
      <CardContent className='p-6 space-y-6'>
        {/* Seller Info */}
        <div className='flex items-start gap-4'>
          <Avatar className='w-14 h-14 flex-shrink-0'>
            {host.avatar ? (
              <Image
                src={host.avatar}
                alt={host.name}
                width={56}
                height={56}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-lg font-bold'>
                {getInitials(host.name)}
              </div>
            )}
          </Avatar>

          <div className='flex-1 min-w-0'>
            <Typography variant='h5' className='font-bold mb-1 truncate'>
              {host.name}
            </Typography>
            {host.totalListings && (
              <Button
                variant='link'
                className='text-sm text-primary hover:underline p-0 h-auto flex items-center gap-1 group'
              >
                <Typography variant='small'>
                  Xem thêm {host.totalListings} tin khác
                </Typography>
                <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </Button>
            )}
          </div>
        </div>

        {/* Contact Buttons */}
        <div className='space-y-3'>
          <Button
            className='w-full bg-white hover:bg-gray-50 text-foreground border-2 border-primary h-12 font-semibold'
            onClick={handleZaloClick}
          >
            <Image
              src='/svg/google.svg'
              alt='Zalo'
              width={20}
              height={20}
              className='mr-2'
            />
            {t('actions.chatZalo')}
          </Button>

          <Button
            className='w-full bg-primary hover:bg-primary/90 h-12 font-semibold'
            onClick={onCall}
          >
            <Phone className='w-5 h-5 mr-2' />
            {host.maskedPhone} • {t('actions.showPhone')}
          </Button>
        </div>

        {/* Professional Account Info */}
        {host.isProfessional && host.professionalInfo && (
          <div className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg space-y-3'>
            <div className='flex items-start gap-2'>
              <Sparkles className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
              <Typography
                variant='small'
                className='text-foreground leading-relaxed'
              >
                {host.professionalInfo}
              </Typography>
            </div>
            <Button
              variant='link'
              className='text-primary hover:text-primary/80 p-0 h-auto font-semibold flex items-center gap-1 group'
            >
              <span>{t('seller.registerFree')}</span>
              <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SellerContact
