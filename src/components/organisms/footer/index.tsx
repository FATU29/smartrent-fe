import React from 'react'
import { Typography } from '@/components/atoms/typography'
import Logo from '@/components/atoms/logo'
import { useTranslations } from 'next-intl'
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

const Footer: React.FC = () => {
  const t = useTranslations()

  return (
    <footer className='bg-muted/50 border-t border-border'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        {/* Slightly reduced mobile vertical padding, increased large screen breathing space */}
        <div className='py-6 sm:py-10 lg:py-14'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12'>
            {/* Company Info */}
            <div className='space-y-3'>
              <Logo size='medium' clickable={false} />
              <Typography variant='muted' className='text-sm leading-relaxed'>
                {t('footer.description')}
              </Typography>
              <div className='flex space-x-4 mt-5 sm:mt-6'>
                <button
                  className='text-muted-foreground hover:text-primary transition-colors'
                  aria-label='Facebook'
                >
                  <Facebook className='h-5 w-5' />
                </button>
                <button
                  className='text-muted-foreground hover:text-primary transition-colors'
                  aria-label='Instagram'
                >
                  <Instagram className='h-5 w-5' />
                </button>
                <button
                  className='text-muted-foreground hover:text-primary transition-colors'
                  aria-label='Twitter'
                >
                  <Twitter className='h-5 w-5' />
                </button>
                <button
                  className='text-muted-foreground hover:text-primary transition-colors'
                  aria-label='Youtube'
                >
                  <Youtube className='h-5 w-5' />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className='space-y-4'>
              <Typography
                variant='h6'
                className='text-foreground font-semibold'
              >
                {t('footer.quickLinks')}
              </Typography>
              <div className='space-y-2'>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.aboutUs')}
                  </Typography>
                </button>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.properties')}
                  </Typography>
                </button>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.services')}
                  </Typography>
                </button>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.contact')}
                  </Typography>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className='space-y-4'>
              <Typography
                variant='h6'
                className='text-foreground font-semibold'
              >
                {t('footer.support')}
              </Typography>
              <div className='space-y-2'>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.helpCenter')}
                  </Typography>
                </button>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.privacyPolicy')}
                  </Typography>
                </button>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.termsOfService')}
                  </Typography>
                </button>
                <button className='block text-left text-sm text-muted-foreground hover:text-primary transition-colors'>
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground hover:text-primary transition-colors'
                  >
                    {t('footer.faq')}
                  </Typography>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className='space-y-4'>
              <Typography
                variant='h6'
                className='text-foreground font-semibold'
              >
                {t('footer.contactInfo')}
              </Typography>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground'
                  >
                    {t('footer.address')}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground'
                  >
                    {t('footer.phone')}
                  </Typography>
                </div>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <Typography
                    variant='small'
                    className='text-sm text-muted-foreground'
                  >
                    {t('footer.email')}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='mt-10 lg:mt-12 pt-6 lg:pt-8 border-t border-border'>
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
