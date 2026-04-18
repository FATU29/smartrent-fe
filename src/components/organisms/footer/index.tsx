import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, GraduationCap } from 'lucide-react'

import Logo from '@/components/atoms/logo'
import { Button } from '@/components/atoms/button'

const SOCIAL_ICONS = [
  { src: '/svg/facebook.svg', alt: 'Facebook', label: 'Facebook' },
  { src: '/svg/instagram.svg', alt: 'Instagram', label: 'Instagram' },
  { src: '/svg/x.svg', alt: 'X', label: 'X' },
  { src: '/svg/zalo.svg', alt: 'Zalo', label: 'Zalo' },
]

interface FooterNavColumnProps {
  heading: string
  links: ReadonlyArray<readonly [string, string]>
  t: (key: string) => string
}

const FooterNavColumn: React.FC<FooterNavColumnProps> = ({
  heading,
  links,
  t,
}) => (
  <div className='space-y-4'>
    <p className='text-[11px] font-semibold tracking-widest text-gray-400 uppercase'>
      {heading}
    </p>
    <nav className='space-y-2.5'>
      {links.map(([key, href]) => (
        <Link
          key={key}
          href={href}
          className='block text-sm text-gray-600 hover:text-gray-900 transition-colors'
        >
          {t(key)}
        </Link>
      ))}
    </nav>
  </div>
)

const DISCOVER_LINKS = [
  ['aboutUs', '#'],
  ['properties', '/properties'],
  ['services', '#'],
  ['contact', '#'],
] as const

const SUPPORT_LINKS = [
  ['helpCenter', '#'],
  ['privacyPolicy', '#'],
  ['termsOfService', '#'],
  ['faq', '#'],
] as const

const Footer: React.FC = () => {
  const t = useTranslations('footer')

  return (
    <footer className='bg-stone-50 border-t border-gray-200'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        {/* ── Academic notice banner ── */}
        <div className='py-5'>
          <div className='flex items-center justify-between gap-4 bg-white border border-blue-100 rounded-xl px-5 py-3.5'>
            <div className='flex items-center gap-3.5 min-w-0'>
              <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0'>
                <GraduationCap className='w-5 h-5 text-blue-600' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-blue-700 leading-tight'>
                  {t('academic.badge')}
                </p>
                <p className='text-sm text-gray-500 leading-snug mt-0.5 line-clamp-1'>
                  {t('academic.description')}
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='flex-shrink-0 text-sm h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50'
              asChild
            >
              <a href='mailto:smartrent.tools@gmail.com'>
                {t('academic.requestRemoval')}
              </a>
            </Button>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-t border-gray-200'>
          {/* Col 1 — Brand */}
          <div className='col-span-2 lg:col-span-1 space-y-4'>
            <Logo size='large' clickable={false} />
            <p className='text-sm text-gray-500 leading-relaxed max-w-xs'>
              {t('description')}
            </p>
            <div className='flex gap-2 pt-1'>
              {SOCIAL_ICONS.map(({ src, alt, label }) => (
                <button
                  key={alt}
                  className='w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors'
                  aria-label={label}
                >
                  <Image src={src} alt={alt} width={18} height={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Col 2 — Khám phá */}
          <FooterNavColumn
            heading={t('discover')}
            links={DISCOVER_LINKS}
            t={t}
          />

          {/* Col 3 — Hỗ trợ */}
          <FooterNavColumn heading={t('support')} links={SUPPORT_LINKS} t={t} />

          {/* Col 4 — Liên hệ */}
          <div className='space-y-4'>
            <p className='text-[11px] font-semibold tracking-widest text-gray-400 uppercase'>
              {t('contactInfo')}
            </p>
            <div className='space-y-3'>
              <div className='flex items-start gap-2.5'>
                <MapPin className='w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400' />
                <span className='text-sm text-gray-600 leading-snug'>
                  {t('address')}
                </span>
              </div>
              <div className='flex items-center gap-2.5'>
                <Phone className='w-4 h-4 flex-shrink-0 text-gray-400' />
                <a
                  href={`tel:${t('phone').replaceAll(' ', '')}`}
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors tabular-nums'
                >
                  {t('phone')}
                </a>
              </div>
              <div className='flex items-center gap-2.5'>
                <Mail className='w-4 h-4 flex-shrink-0 text-gray-400' />
                <a
                  href={`mailto:${t('email')}`}
                  className='text-sm text-blue-600 hover:underline transition-colors'
                >
                  {t('email')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className='flex flex-col sm:flex-row justify-between items-center gap-3 py-4 border-t border-gray-200'>
          <p className='text-sm text-gray-400'>{t('copyright')}</p>
          <div className='flex items-center gap-5'>
            {(['privacy', 'terms', 'cookies', 'sitemap'] as const).map(
              (key) => (
                <Link
                  key={key}
                  href='#'
                  className='text-sm text-gray-500 hover:text-gray-800 transition-colors'
                >
                  {t(key)}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
