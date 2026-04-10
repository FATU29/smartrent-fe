import React from 'react'
import { Typography } from '@/components/atoms/typography'
import Logo from '@/components/atoms/logo'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

const Footer: React.FC = () => {
  const t = useTranslations()

  return (
    <footer className='bg-muted/50'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        {/* Slightly reduced mobile vertical padding, increased large screen breathing space */}
        <div className='py-6 sm:py-10 lg:py-14'>
          <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-12'>
            {/* Company Info */}
            <div className='col-span-2 sm:col-span-2 lg:col-span-1 space-y-3 flex flex-col items-center text-center sm:items-start sm:text-left'>
              <Logo size='large' clickable={false} />
              <Typography
                variant='muted'
                className='text-sm leading-relaxed max-w-md sm:max-w-none'
              >
                {t('footer.description')}
              </Typography>
              <div className='flex space-x-4 mt-5 sm:mt-6 justify-center sm:justify-start'>
                <button
                  className='hover:opacity-70 transition-opacity'
                  aria-label='Facebook'
                >
                  <Image
                    src='/svg/facebook.svg'
                    alt='Facebook'
                    width={24}
                    height={24}
                  />
                </button>
                <button
                  className='hover:opacity-70 transition-opacity'
                  aria-label='Instagram'
                >
                  <Image
                    src='/svg/instagram.svg'
                    alt='Instagram'
                    width={24}
                    height={24}
                  />
                </button>
                <button
                  className='hover:opacity-70 transition-opacity'
                  aria-label='X'
                >
                  <Image src='/svg/x.svg' alt='X' width={24} height={24} />
                </button>
                <button
                  className='hover:opacity-70 transition-opacity'
                  aria-label='Zalo'
                >
                  <Image
                    src='/svg/zalo.svg'
                    alt='Zalo'
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className='space-y-4 flex flex-col items-center lg:items-start'>
              <Typography
                variant='h6'
                className='text-foreground font-semibold text-center lg:text-left text-sm sm:text-base'
              >
                {t('footer.quickLinks')}
              </Typography>
              <div className='space-y-2 w-full'>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.aboutUs')}
                  </Typography>
                </button>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.properties')}
                  </Typography>
                </button>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.services')}
                  </Typography>
                </button>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.contact')}
                  </Typography>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className='space-y-4 flex flex-col items-center lg:items-start'>
              <Typography
                variant='h6'
                className='text-foreground font-semibold text-center lg:text-left text-sm sm:text-base'
              >
                {t('footer.support')}
              </Typography>
              <div className='space-y-2 w-full'>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.helpCenter')}
                  </Typography>
                </button>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.privacyPolicy')}
                  </Typography>
                </button>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.termsOfService')}
                  </Typography>
                </button>
                <button className='block text-center lg:text-left text-sm text-muted-foreground hover:text-primary transition-colors w-full'>
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.faq')}
                  </Typography>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className='col-span-2 lg:col-span-1 space-y-4 flex flex-col items-center lg:items-start'>
              <Typography
                variant='h6'
                className='text-foreground font-semibold text-center lg:text-left text-sm sm:text-base'
              >
                {t('footer.contactInfo')}
              </Typography>
              <div className='grid grid-cols-1 min-[420px]:grid-cols-3 lg:grid-cols-1 gap-2 w-full'>
                <div className='flex items-start justify-center lg:justify-start gap-2 rounded-md bg-background/70 px-3 py-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground text-center lg:text-left leading-relaxed'
                  >
                    {t('footer.address')}
                  </Typography>
                </div>
                <div className='flex items-start justify-center lg:justify-start gap-2 rounded-md bg-background/70 px-3 py-2'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground text-center lg:text-left leading-relaxed'
                  >
                    {t('footer.phone')}
                  </Typography>
                </div>
                <div className='flex items-start justify-center lg:justify-start gap-2 rounded-md bg-background/70 px-3 py-2'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <Typography
                    variant='small'
                    className='text-xs sm:text-sm text-muted-foreground text-center lg:text-left leading-relaxed'
                  >
                    {t('footer.email')}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='mt-8'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4'>
              <Typography
                variant='small'
                className='text-muted-foreground text-center sm:text-left'
              >
                {t('footer.copyright')}
              </Typography>
              <div className='flex items-center gap-4'>
                <button className='text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.privacy')}
                  </Typography>
                </button>
                <button className='text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.terms')}
                  </Typography>
                </button>
              </div>
            </div>
            <div className='mt-5 sm:mt-6 lg:mt-7'>
              <Typography
                variant='small'
                className='text-[11px] sm:text-xs leading-relaxed text-muted-foreground text-center max-w-3xl sm:max-w-4xl mx-auto px-2'
              >
                {t('footer.disclaimer')}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
