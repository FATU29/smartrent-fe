import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { Plus, Building2, Bell, ChevronDown, Wallet, X } from 'lucide-react'
import { SELLER_ROUTES } from '@/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { NAV_ITEMS } from './index.helper'
import { SELLERNET_NAV } from '@/components/layouts/sellernet/index.helper'
import VerticalNav, {
  type VerticalNavItem as GenericVerticalNavItem,
} from '@/components/molecules/vertical-nav/VerticalNav'
import MobileNavItem from '@/components/atoms/nav/MobileNavItem'
import MobileNavCenterAction from '@/components/atoms/nav/MobileNavCenterAction'

type SellerLayoutProps = {
  children: React.ReactNode
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const router = useRouter()
  const t = useTranslations('navigation.seller')
  const tNav = useTranslations('navigation')
  const tCreatePost = useTranslations('createPost')
  const [showSellernetMenu, setShowSellernetMenu] = useState(false)

  const isActive = useCallback(
    (href: string) => router.pathname.startsWith(href),
    [router.pathname],
  )

  // Active item derived from config (fallback to overview)
  const activeItem = useMemo(() => {
    return (
      NAV_ITEMS.find((item) => isActive(item.href) && item.key !== 'create') ||
      NAV_ITEMS.find((item) => isActive(item.href)) ||
      NAV_ITEMS[0]
    )
  }, [isActive])

  const headerTitle = useMemo(() => {
    return router.pathname.startsWith(SELLER_ROUTES.CREATE)
      ? tCreatePost('title')
      : t(activeItem.key)
  }, [activeItem.key, router.pathname, t, tCreatePost])

  // Mobile bottom nav derived groups
  const mobileNormal = useMemo(
    () =>
      NAV_ITEMS.filter(
        (n) => n.showOnMobile !== false && n.mobilePlacement !== 'centerAction',
      ).sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0)),
    [],
  )
  const mobileCenter = useMemo(
    () =>
      NAV_ITEMS.find(
        (n) => n.showOnMobile !== false && n.mobilePlacement === 'centerAction',
      ),
    [],
  )
  const mobileLeft = useMemo(() => mobileNormal.slice(0, 2), [mobileNormal])
  const mobileRight = useMemo(() => mobileNormal.slice(2, 4), [mobileNormal])

  // Close overlay on route change
  useEffect(() => {
    setShowSellernetMenu(false)
  }, [router.pathname])

  return (
    <>
      <div className='relative min-h-[100dvh] md:min-h-screen bg-background -mt-px md:mt-0'>
        {/* Full-width grid so sidebar can be flush with left edge */}
        <div className='w-full'>
          <div className='grid grid-cols-1 md:grid-cols-[200px_1fr] md:pb-6 pb-4 md:gap-0'>
            {/* Desktop sidebar */}
            <aside className='hidden md:block'>
              <div className='sticky top-0 h-screen rounded-none border-r bg-card p-3 shadow-sm overflow-y-auto overflow-x-hidden pr-1 flex flex-col'>
                {/* Logo */}
                <Link
                  href='/'
                  className='flex items-center gap-2 px-2 py-2 mb-1.5'
                >
                  <span className='inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
                    <Building2 className='h-4 w-4' />
                  </span>
                  <span className='text-base font-semibold tracking-tight'>
                    SmartRent
                  </span>
                </Link>

                {/* Recursive vertical navigation */}
                <VerticalNav
                  items={
                    NAV_ITEMS.filter(
                      (n) => n.showOnDesktop !== false,
                    ) as unknown as GenericVerticalNavItem[]
                  }
                  t={t as unknown as (key: string) => string}
                  isActive={isActive}
                />
              </div>
            </aside>

            {/* Content area: header in content column only */}
            <section className='min-h-[60vh] pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-0 pt-[calc(env(safe-area-inset-top)+56px)] md:pt-0 flex flex-col'>
              {/* Header: fixed on mobile (full width), sticky inside column on desktop */}
              <div className='fixed inset-x-0 top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b shadow-sm md:shadow md:sticky md:inset-x-auto md:top-0 md:z-20'>
                <div className='px-4 sm:px-6 pt-[max(env(safe-area-inset-top),0px)] md:px-6 md:pt-0'>
                  <div className='flex h-14 items-center justify-between gap-2 md:justify-between md:gap-3 md:h-auto md:py-4'>
                    {/* Left: Back logo (mobile) + title/desc */}
                    <div className='flex items-center gap-3 min-w-0'>
                      <Link
                        href='/'
                        aria-label='Home'
                        className='md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground'
                      >
                        <Building2 className='h-5 w-5' />
                      </Link>
                      <div className='min-w-0'>
                        <div className='hidden md:block text-base md:text-lg font-semibold truncate'>
                          {headerTitle}
                        </div>
                        {router.pathname.startsWith(SELLER_ROUTES.CREATE) && (
                          <div className='hidden md:block text-xs md:text-sm text-muted-foreground truncate'>
                            {tCreatePost('description')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className='flex items-center justify-center md:justify-end gap-2 sm:gap-3'>
                      {/* Balance pill with dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type='button'
                            className='inline-flex items-center gap-2 rounded-full border bg-muted px-2.5 py-1.5 text-xs md:px-3 md:py-2 md:text-sm shadow-sm hover:bg-muted/80 transition-colors'
                          >
                            <span className='inline-flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow'>
                              <Wallet className='h-3.5 w-3.5 md:h-4 md:w-4' />
                            </span>
                            <span className='font-semibold'>0 đ</span>
                            <ChevronDown className='h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-64'>
                          <DropdownMenuLabel className='flex items-center justify-between'>
                            <span>{t('balanceTitle')}</span>
                            <span className='font-semibold'>0</span>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='flex items-center justify-between'>
                            <span>{t('postAccount')}</span>
                            <span className='font-medium'>0</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className='flex items-center justify-between'>
                            <span>{t('promoAccount')}</span>
                            <span className='font-medium'>0</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Deposit */}
                      <button
                        type='button'
                        className='inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-semibold shadow hover:bg-primary/90'
                      >
                        <span className='inline-flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-background/10'>
                          <Plus className='h-3.5 w-3.5 md:h-4 md:w-4' />
                        </span>
                        {t('deposit')}
                      </button>

                      {/* Notifications */}
                      <button
                        type='button'
                        aria-label={t('notifications')}
                        className='relative inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border bg-background hover:bg-accent hover:text-accent-foreground transition-colors'
                      >
                        <Bell className='h-5 w-5' />
                        <span className='absolute -right-1 -top-1 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground'>
                          4
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body container with constrained width (no extra top margin now) */}
              <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 md:pt-4 flex-1 flex flex-col'>
                <div className='md:rounded-xl md:border md:bg-card md:p-4 lg:p-6 flex-1 flex flex-col'>
                  {children}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar - driven by NAV_ITEMS config */}
      <nav className='fixed md:hidden bottom-0 inset-x-0 z-40 bg-card/95 border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-card/80 h-16 pb-[env(safe-area-inset-bottom)] pl-[max(env(safe-area-inset-left),0px)] pr-[max(env(safe-area-inset-right),0px)]'>
        <div className='mx-auto max-w-3xl h-full'>
          <ul className='relative grid grid-cols-5 items-center h-full px-2'>
            {mobileLeft.map((item) => (
              <MobileNavItem
                key={item.key}
                label={t(item.key)}
                icon={item.icon}
                href={item.href}
                active={isActive(item.href)}
              />
            ))}

            {/* Center action */}
            {mobileCenter ? (
              <MobileNavCenterAction
                href={mobileCenter.href}
                ariaLabel={t(mobileCenter.key)}
                icon={mobileCenter.icon}
              />
            ) : (
              <span />
            )}

            {mobileRight.map((item) =>
              item.key === 'account' ? (
                <MobileNavItem
                  key={item.key}
                  label={t(item.key)}
                  icon={item.icon}
                  onClick={() => setShowSellernetMenu(true)}
                  ariaLabel={tNav('sellernet.personalAccount')}
                  tone='muted'
                />
              ) : (
                <MobileNavItem
                  key={item.key}
                  label={t(item.key)}
                  icon={item.icon}
                  href={item.href}
                  active={isActive(item.href)}
                />
              ),
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile fullscreen Sellernet navigation (account) */}
      {showSellernetMenu && (
        <div className='md:hidden fixed inset-0 z-50 bg-background'>
          {/* Header */}
          <div className='sticky top-0 flex items-center justify-between h-14 px-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80'>
            <div className='font-semibold'>
              {tNav('sellernet.personalAccount')}
            </div>
            <button
              type='button'
              onClick={() => setShowSellernetMenu(false)}
              aria-label='Close'
              className='inline-flex h-9 w-9 items-center justify-center rounded-full border'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
          {/* Body: vertical nav */}
          <div className='p-3 overflow-y-auto h-[calc(100%-56px)]'>
            <VerticalNav
              items={SELLERNET_NAV as unknown as GenericVerticalNavItem[]}
              t={tNav as unknown as (key: string) => string}
              isActive={(href) => router.pathname.startsWith(href)}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default SellerLayout
