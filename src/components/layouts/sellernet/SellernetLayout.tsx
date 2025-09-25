import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { Building2, X } from 'lucide-react'
import VerticalNav, {
  type VerticalNavItem,
} from '@/components/molecules/vertical-nav/VerticalNav'
import MainLayout from '@/components/layouts/MainLayout'
import { SELLERNET_NAV, SellernetNavItem } from './index.helper'
import { NAV_ITEMS } from '@/components/layouts/sellerLayout/index.helper'
import MobileNavItem from '@/components/atoms/nav/MobileNavItem'
import MobileNavCenterAction from '@/components/atoms/nav/MobileNavCenterAction'
import { SELLERNET_ROUTES } from '@/constants'

export type SellernetLayoutProps = { children: React.ReactNode }

const SellernetLayout: React.FC<SellernetLayoutProps> = ({ children }) => {
  const router = useRouter()
  const t = useTranslations('navigation')
  const tSeller = useTranslations('navigation.seller')
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  // Close overlay on route change
  useEffect(() => {
    setShowAccountMenu(false)
  }, [router.pathname])

  const isActive = useCallback(
    (href: string) => router.pathname.startsWith(href),
    [router.pathname],
  )

  const items: VerticalNavItem[] = useMemo(() => SELLERNET_NAV, [])
  // Build Seller mobile nav groups
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

  // Derive active header title from nav tree
  const activeTitle = useMemo(() => {
    if (
      router.pathname.startsWith(SELLERNET_ROUTES.PERSONAL_PREFIX) ||
      router.pathname.startsWith(SELLERNET_ROUTES.ACCOUNT)
    ) {
      return t('accountManagement')
    }
    let lastMatchKey: string | undefined
    const visit = (nodes: SellernetNavItem[]) => {
      for (const node of nodes) {
        if (node.href && isActive(node.href)) lastMatchKey = node.key
        if (node.children) visit(node.children)
      }
    }
    visit(SELLERNET_NAV)
    const key = lastMatchKey ?? SELLERNET_NAV[0]?.key
    return key ? t(key) : 'SmartRent'
  }, [isActive, t, router.pathname])

  return (
    <MainLayout>
      <div className='relative min-h-[100dvh] md:min-h-screen bg-background'>
        <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-[max-content_1fr] gap-4 md:gap-6 pt-1 pb-2 md:py-6'>
            {/* Desktop sidebar */}
            <aside className='hidden md:block'>
              <div className='sticky top-10 rounded-xl border bg-card p-3 shadow-sm max-h-[calc(100vh-40px)] overflow-y-auto overflow-x-hidden pr-1 w-max'>
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
                  items={items}
                  t={(key) => t(key)}
                  isActive={isActive}
                />
              </div>
            </aside>

            {/* Right section: header (top) + content (below) */}
            <section className='min-h-[60vh] pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-0 pt-0 md:pt-0'>
              {/* Header Card */}
              <div className='hidden md:block sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b md:static md:rounded-xl md:border md:bg-card md:shadow-sm mb-3 md:mb-6'>
                <div className='px-4 sm:px-6 pt-0 md:px-4 md:pt-0'>
                  <div className='flex h-14 items-center justify-between gap-2 md:gap-3 md:h-auto md:py-4'>
                    <div className='min-w-0'>
                      <div className='text-base md:text-lg font-semibold truncate'>
                        {activeTitle}
                      </div>
                    </div>
                    {/* Right actions placeholder */}
                    <div className='hidden md:flex items-center justify-end gap-2 sm:gap-3'></div>
                  </div>
                </div>
              </div>

              {/* Content Card */}
              <div className='md:rounded-xl md:border md:bg-card md:shadow-sm p-4 md:p-4 lg:p-6'>
                {children}
              </div>
            </section>
          </div>
        </div>
      </div>
      {/* Mobile bottom tab bar - use Seller bottom nav */}
      <nav className='fixed md:hidden bottom-0 inset-x-0 z-40 bg-card/95 border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-card/80 h-16 pb-[env(safe-area-inset-bottom)] pl-[max(env(safe-area-inset-left),0px)] pr-[max(env(safe-area-inset-right),0px)]'>
        <div className='mx-auto max-w-3xl h-full'>
          <ul className='relative grid grid-cols-5 items-center h-full px-2'>
            {mobileLeft.map((item) => (
              <MobileNavItem
                key={item.key}
                label={tSeller(item.key)}
                icon={item.icon}
                href={item.href}
                active={router.pathname.startsWith(item.href)}
              />
            ))}

            {mobileCenter ? (
              <MobileNavCenterAction
                href={mobileCenter.href}
                ariaLabel={tSeller(mobileCenter.key)}
                icon={mobileCenter.icon}
              />
            ) : (
              <span />
            )}

            {mobileRight.map((item) =>
              item.key === 'account' ? (
                <MobileNavItem
                  key={item.key}
                  label={tSeller(item.key)}
                  icon={item.icon}
                  onClick={() => setShowAccountMenu(true)}
                  ariaLabel={t('sellernet.personalAccount')}
                  tone='muted'
                />
              ) : (
                <MobileNavItem
                  key={item.key}
                  label={tSeller(item.key)}
                  icon={item.icon}
                  href={item.href}
                  active={router.pathname.startsWith(item.href)}
                />
              ),
            )}
          </ul>
        </div>
      </nav>

      {/* Fullscreen account navigation on mobile */}
      {showAccountMenu && (
        <div className='md:hidden fixed inset-0 z-50 bg-background'>
          {/* Header */}
          <div className='sticky top-0 flex items-center justify-between h-14 px-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80'>
            <div className='font-semibold'>
              {t('sellernet.personalAccount')}
            </div>
            <button
              type='button'
              onClick={() => setShowAccountMenu(false)}
              aria-label='Close'
              className='inline-flex h-9 w-9 items-center justify-center rounded-full border'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
          {/* Body: vertical nav */}
          <div className='p-3 overflow-y-auto h-[calc(100%-56px)]'>
            <VerticalNav
              items={items}
              t={(key) => t(key)}
              isActive={(href) => router.pathname.startsWith(href)}
            />
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default SellernetLayout
