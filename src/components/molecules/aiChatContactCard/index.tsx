import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Phone, Mail, ArrowRight } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { cn } from '@/lib/utils'
import type { ChatListing } from '@/api/types/ai.type'
import { useContactRevealGuard } from '@/hooks/useAuth'
import { ContactRevealService } from '@/api/services/contactReveal.service'
import LoginRequiredDialog from '@/components/molecules/loginRequiredDialog'

interface AiChatContactCardProps {
  listing: ChatListing
  className?: string
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatVNPhone = (phone: string): string => {
  const d = phone.replace(/\D/g, '')
  if (d.length === 10) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
  if (d.length === 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  return phone
}

const CONTACT_ROW_CLASSNAME =
  'flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors w-full text-left'

interface ContactRowProps {
  icon: React.ReactNode
  label: string
  value: string
  href: string
  isAuthenticated: boolean
  onRequireAuth: () => void
  guestLabel: string
  external?: boolean
  /** When true, the real value is replaced with `guestLabel` for guests. */
  hideValueForGuest?: boolean
  trailing?: React.ReactNode
  /** Audit callback fired when an authenticated user opens this contact. */
  onReveal?: () => void
}

// A guest never gets the real value or a live href in the DOM — the row is a
// plain button that opens the login gate. Only after auth is the real
// phone/email/link wired into an anchor.
const ContactRow: React.FC<ContactRowProps> = ({
  icon,
  label,
  value,
  href,
  isAuthenticated,
  onRequireAuth,
  guestLabel,
  external = false,
  hideValueForGuest = false,
  trailing,
  onReveal,
}) => {
  const displayValue =
    !isAuthenticated && hideValueForGuest ? guestLabel : value

  const body = (
    <>
      <div className='w-8 h-8 rounded-md bg-muted/50 border border-border flex items-center justify-center flex-shrink-0'>
        {icon}
      </div>
      <div className='min-w-0 flex-1 overflow-hidden'>
        <p className='text-xs uppercase tracking-wide text-muted-foreground leading-none mb-1'>
          {label}
        </p>
        <p className='text-sm text-foreground truncate leading-tight'>
          {displayValue}
        </p>
      </div>
      {trailing}
    </>
  )

  if (!isAuthenticated) {
    return (
      <button
        type='button'
        className={CONTACT_ROW_CLASSNAME}
        onClick={(e) => {
          e.stopPropagation()
          onRequireAuth()
        }}
      >
        {body}
      </button>
    )
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={CONTACT_ROW_CLASSNAME}
      onClick={(e) => {
        e.stopPropagation()
        onReveal?.()
      }}
    >
      {body}
    </a>
  )
}

const AiChatContactCard: React.FC<AiChatContactCardProps> = ({
  listing,
  className,
}) => {
  const t = useTranslations('chat.contact')
  const tContact = useTranslations('contactAccess')
  const { isAuthenticated, requireAuth, dialogProps } = useContactRevealGuard()
  const { user, ownerContactPhoneNumber, ownerZaloLink } = listing

  if (!user) return null

  const displayName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || t('landlord')
  const phone = ownerContactPhoneNumber || user.phoneNumber
  const email = user.email
  const zaloLink = ownerZaloLink
  const sellerPageUrl = `/properties/seller/${user.userId}`
  const guestLabel = tContact('viewContactCta')
  const onRequireAuth = () => requireAuth()

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden',
        className,
      )}
    >
      {/* ── Header ── */}
      <div className='flex items-center gap-3 p-3'>
        <Avatar className='h-10 w-10 flex-shrink-0'>
          <AvatarImage src={undefined} alt={displayName} />
          <AvatarFallback className='bg-blue-50 text-blue-700 text-sm font-semibold'>
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className='min-w-0 flex flex-col gap-0.5'>
          <p className='text-sm font-semibold text-foreground truncate leading-tight'>
            {displayName}
          </p>
          <span className='inline-flex items-center self-start gap-1.5 bg-muted rounded-full px-2 py-0.5'>
            <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0' />
            <span className='text-xs text-muted-foreground'>
              {t('landlord')}
            </span>
          </span>
        </div>
      </div>

      <div className='mx-3 border-t border-border' />

      {/* ── Contact rows (gated behind login) ── */}
      <div className='p-2 space-y-0.5'>
        {phone && (
          <ContactRow
            icon={
              <Phone
                className='w-3.5 h-3.5 text-muted-foreground'
                aria-hidden='true'
              />
            }
            label='Điện thoại'
            value={formatVNPhone(phone)}
            href={`https://zalo.me/${phone.replace(/\D/g, '')}`}
            external
            hideValueForGuest
            isAuthenticated={isAuthenticated}
            onRequireAuth={onRequireAuth}
            guestLabel={guestLabel}
            onReveal={() => ContactRevealService.logReveal(user.userId, 'PHONE')}
          />
        )}

        {email && (
          <ContactRow
            icon={
              <Mail
                className='w-3.5 h-3.5 text-muted-foreground'
                aria-hidden='true'
              />
            }
            label='Email'
            value={email}
            href={`mailto:${email}`}
            hideValueForGuest
            isAuthenticated={isAuthenticated}
            onRequireAuth={onRequireAuth}
            guestLabel={guestLabel}
            onReveal={() => ContactRevealService.logReveal(user.userId, 'EMAIL')}
          />
        )}

        {zaloLink && (
          <ContactRow
            icon={
              <Image
                src='/svg/zalo.svg'
                alt='Zalo'
                width={16}
                height={16}
                aria-hidden='true'
              />
            }
            label='Nhắn tin'
            value='Zalo'
            href={zaloLink}
            external
            isAuthenticated={isAuthenticated}
            onRequireAuth={onRequireAuth}
            guestLabel={guestLabel}
            onReveal={() => ContactRevealService.logReveal(user.userId, 'ZALO')}
            trailing={
              <span className='text-xs font-medium bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 flex-shrink-0'>
                Mở
              </span>
            }
          />
        )}
      </div>

      {/* ── CTA footer link (navigation only, not gated) ── */}
      <Link
        href={sellerPageUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center justify-between px-3 py-2.5 border-t border-border hover:bg-accent transition-colors group'
        onClick={(e) => e.stopPropagation()}
      >
        <span className='text-sm text-blue-600 font-medium'>
          {t('viewSellerPage')}
        </span>
        <ArrowRight
          className='w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all'
          strokeWidth={2}
          aria-hidden='true'
        />
      </Link>

      <LoginRequiredDialog {...dialogProps} />
    </div>
  )
}

export default AiChatContactCard
