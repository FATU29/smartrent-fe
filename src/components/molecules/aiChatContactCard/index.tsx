import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Phone, Mail, ArrowRight } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { cn } from '@/lib/utils'
import type { ChatListing } from '@/api/types/ai.type'

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

const AiChatContactCard: React.FC<AiChatContactCardProps> = ({
  listing,
  className,
}) => {
  const t = useTranslations('chat.contact')
  const { user, ownerContactPhoneNumber, ownerZaloLink } = listing

  if (!user) return null

  const displayName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || t('landlord')
  const phone = ownerContactPhoneNumber || user.phoneNumber
  const email = user.email
  const zaloLink = ownerZaloLink
  const sellerPageUrl = `/properties/seller/${user.userId}`

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden',
        className,
      )}
    >
      {/* ── Header ── */}
      <div className='flex items-center gap-2.5 px-3 pt-3 pb-2.5'>
        <Avatar className='h-9 w-9 flex-shrink-0'>
          <AvatarImage src={undefined} alt={displayName} />
          <AvatarFallback className='bg-blue-50 text-blue-700 text-xs font-semibold'>
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className='min-w-0'>
          <p className='text-[13px] font-semibold text-foreground truncate leading-snug'>
            {displayName}
          </p>
          <span className='inline-flex items-center gap-1 mt-0.5 bg-muted rounded-full px-2 py-0.5'>
            <span className='w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0' />
            <span className='text-[10px] text-muted-foreground'>
              {t('landlord')}
            </span>
          </span>
        </div>
      </div>

      <div className='mx-3 border-t border-border' />

      {/* ── Contact rows ── */}
      <div className='px-2 py-1.5 space-y-0'>
        {phone && (
          <a
            href={`tel:${phone.replace(/[\s.-]/g, '')}`}
            className='flex items-center gap-2.5 py-1.5 px-1.5 rounded-lg hover:bg-accent transition-colors'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='w-6 h-6 rounded-md bg-muted/40 border border-border flex items-center justify-center flex-shrink-0'>
              <Phone
                className='w-3 h-3 text-muted-foreground'
                aria-hidden='true'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-[9px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5'>
                Điện thoại
              </p>
              <p className='text-[12px] text-foreground tabular-nums'>
                {formatVNPhone(phone)}
              </p>
            </div>
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className='flex items-center gap-2.5 py-1.5 px-1.5 rounded-lg hover:bg-accent transition-colors'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='w-6 h-6 rounded-md bg-muted/40 border border-border flex items-center justify-center flex-shrink-0'>
              <Mail
                className='w-3 h-3 text-muted-foreground'
                aria-hidden='true'
              />
            </div>
            <div className='min-w-0 flex-1 overflow-hidden'>
              <p className='text-[9px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5'>
                Email
              </p>
              <p className='text-[12px] text-foreground truncate'>{email}</p>
            </div>
          </a>
        )}

        {zaloLink && (
          <a
            href={zaloLink}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2.5 py-1.5 px-1.5 rounded-lg hover:bg-accent transition-colors'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='w-6 h-6 rounded-md bg-muted/40 border border-border flex items-center justify-center flex-shrink-0'>
              <Image
                src='/svg/zalo.svg'
                alt='Zalo'
                width={14}
                height={14}
                aria-hidden='true'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-[9px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5'>
                Nhắn tin
              </p>
              <p className='text-[12px] text-foreground'>Zalo</p>
            </div>
            <span className='text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full px-1.5 py-0.5 flex-shrink-0'>
              Mở
            </span>
          </a>
        )}
      </div>

      {/* ── CTA footer link ── */}
      <Link
        href={sellerPageUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center justify-between px-3 py-2 border-t border-border hover:bg-accent transition-colors group'
        onClick={(e) => e.stopPropagation()}
      >
        <span className='text-[11px] text-blue-600 font-medium'>
          {t('viewSellerPage')}
        </span>
        <ArrowRight
          className='w-3 h-3 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all'
          strokeWidth={2}
          aria-hidden='true'
        />
      </Link>
    </div>
  )
}

export default AiChatContactCard
