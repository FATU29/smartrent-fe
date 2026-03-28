import React, { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { SELLER_ROUTES } from '@/constants'
import Logo from '@/components/atoms/logo'
import NotificationPanel from '@/components/molecules/notificationPanel'

import { NAV_ITEMS } from './index.helper'
import VerticalNav from '@/components/molecules/verticalNav/VerticalNav'
import MobileNavItem from '@/components/atoms/nav/MobileNavItem'
import MobileNavCenterAction from '@/components/atoms/nav/MobileNavCenterAction'
import ThemeSwitch from '@/components/molecules/themeSwitch'

type SellerLayoutProps = {
  children: React.ReactNode
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const router = useRouter()
  const t = useTranslations('navigation.seller')
  const tCreatePost = useTranslations('createPost')

  const isActive = useCallback(
    (href: string) => router.pathname.startsWith(href),
    [router.pathname],
  )

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
  return (
    <>
      <div className='relative min-h-[100dvh] md:min-h-screen bg-background -mt-px md:mt-0'>
        <div className='w-full'>
          <div className='md:pb-6 pb-4 md:gap-0'>
            <aside className='hidden md:block'>
              <div className='fixed left-0 top-0 z-30 h-screen w-[200px] rounded-none border-r bg-card p-3 shadow-sm overflow-y-auto overflow-x-hidden pr-1 flex flex-col'>
                <div className='px-2 py-2 mb-1.5'>
                  <Logo size='small' />
                </div>

                <VerticalNav
                  items={NAV_ITEMS.filter((n) => n.showOnDesktop !== false)}
                  t={t as unknown as (key: string) => string}
                  isActive={isActive}
                />
              </div>
            </aside>

            <section className='min-h-[60vh] pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-0 pt-[calc(env(safe-area-inset-top)+56px)] md:pt-0 md:pl-[200px] flex flex-col'>
              <div className='fixed inset-x-0 top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b shadow-sm md:shadow md:sticky md:inset-x-auto md:top-0 md:z-20'>
                <div className='px-4 sm:px-6 pt-[max(env(safe-area-inset-top),0px)] md:px-6 md:pt-0'>
                  <div className='flex h-14 items-center justify-between gap-2 md:justify-between md:gap-3 md:h-auto md:py-4'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='md:hidden'>
                        <Logo size='small' showText={false} />
                      </div>
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

                    <div className='flex items-center justify-center md:justify-end gap-2 sm:gap-3'>
                      <ThemeSwitch />
                      <NotificationPanel />
                    </div>
                  </div>
                </div>
              </div>

              <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 md:pt-4 flex-1 flex flex-col'>
                <div className='md:rounded-xl md:border md:bg-card md:p-4 lg:p-6 flex-1 flex flex-col'>
                  {children}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

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

            {mobileCenter ? (
              <MobileNavCenterAction
                href={mobileCenter.href}
                ariaLabel={t(mobileCenter.key)}
                icon={mobileCenter.icon}
              />
            ) : (
              <span />
            )}

            {mobileRight.map((item) => (
              <MobileNavItem
                key={item.key}
                label={t(item.key)}
                icon={item.icon}
                href={item.href}
                active={isActive(item.href)}
              />
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}

export default SellerLayout
