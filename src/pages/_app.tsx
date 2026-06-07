import '@/styles/globals.css'
import '@/styles/reset.scss'
import '@/styles/listing-detail.css'
import '@/styles/news-article.css'
import '@/components/molecules/desktopNavigation/navigation.css'
import ThemeDataProvider from '@/contexts/theme'
import AuthProvider from '@/contexts/auth'
import React from 'react'
import type { AppPropsWithLayout } from '@/types/next-page'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import SwitchLanguageProvider from '@/contexts/switchLanguage'
import vi from '@/messages/vi.json'
import { Toaster } from '@/components/atoms/sonner'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { AuthDialogProvider } from '@/contexts/authDialog'
import { fontVariables } from '@/theme/fonts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Query } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import AuthRouteGate from '@/components/utility/AuthRouteGate'
import ErrorBoundary from '@/components/atoms/errorBoundary'
import NextTopLoader from 'nextjs-toploader'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

const AiChatWidget = dynamic(
  () => import('@/components/organisms/aiChatWidget'),
  { ssr: false },
)

// Dev-only React Query Devtools. Isolated in its own dynamically-imported
// chunk so the `process.env.NODE_ENV` gate lives there, NOT in this entry
// module — referencing it here makes Turbopack require the `process` polyfill
// at module evaluation, which crashes dev ("module factory is not available").
const DevtoolsGate = dynamic(
  () => import('@/components/utility/DevtoolsGate'),
  { ssr: false },
)

type Messages = typeof vi

const queryClient = new QueryClient()

// Persist ONLY the two homepage stats queries to localStorage so they survive a
// page reload / new tab and stay cached for a full day — matching the permanent
// backend Redis cache (refreshed by the midnight cron). Everything else (auth,
// listings, …) is intentionally NOT persisted. SSR-safe: localStorage only
// exists in the browser, so the persister is null on the server and we fall
// back to a plain QueryClientProvider there.
const ONE_DAY_MS = 24 * 60 * 60 * 1000

const queryPersister =
  typeof window !== 'undefined'
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: 'SMARTRENT_HOMEPAGE_STATS_CACHE',
      })
    : null

const shouldPersistQuery = (query: Query): boolean => {
  const [scope, section] = query.queryKey
  return (
    query.state.status === 'success' &&
    scope === 'homepage' &&
    (section === 'province-stats' || section === 'category-stats')
  )
}

function AppContent({ Component, pageProps }: AppPropsWithLayout) {
  const { language } = useSwitchLanguage()
  const router = useRouter()
  const getLayout = Component.getLayout ?? ((page) => page)

  // Lazy-load non-default locale. `vi` is the default for ~95% of users so
  // it stays static; `en` is fetched only when the user actually switches.
  const [enMessages, setEnMessages] = React.useState<Messages | null>(null)

  React.useEffect(() => {
    if (language === 'en' && !enMessages) {
      import('@/messages/en.json').then((m) => {
        setEnMessages(m.default as Messages)
      })
    }
  }, [language, enMessages])

  const activeMessages: Messages =
    language === 'en' && enMessages ? enMessages : vi

  // Check if current page should show chat widget
  const showChatWidget = React.useMemo(() => {
    const pathname = router.pathname

    // Don't show on 404 page
    if (pathname === '/404') return false

    // Show on public pages
    const publicPaths = [
      '/',
      '/properties',
      '/auth',
      '/listing-detail',
      '/compare',
    ]

    return publicPaths.some(
      (path) => pathname === path || pathname.startsWith(path + '/'),
    )
  }, [router.pathname])

  const queryTree = (
    <>
      <NextIntlClientProvider locale={language} messages={activeMessages}>
        <NextThemesProvider
          attribute='class'
          defaultTheme='light'
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeDataProvider>
            <AuthProvider>
              <AuthDialogProvider>
                <AuthRouteGate />
                {getLayout(<Component {...pageProps} />)}
                <Toaster />
                {showChatWidget && <AiChatWidget position='bottom-right' />}
              </AuthDialogProvider>
            </AuthProvider>
          </ThemeDataProvider>
        </NextThemesProvider>
      </NextIntlClientProvider>
      <DevtoolsGate />
    </>
  )

  return (
    <div className={fontVariables}>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
      </Head>
      <NextTopLoader
        color='var(--primary)'
        height={3}
        showSpinner={false}
        easing='ease'
        speed={200}
        shadow='0 0 10px var(--primary),0 0 5px var(--primary)'
      />
      {queryPersister ? (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: queryPersister,
            maxAge: ONE_DAY_MS,
            // Bump this string when the stats response shape changes to drop
            // incompatible cached payloads.
            buster: 'homepage-stats-v1',
            dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
          }}
        >
          {queryTree}
        </PersistQueryClientProvider>
      ) : (
        <QueryClientProvider client={queryClient}>
          {queryTree}
        </QueryClientProvider>
      )}
    </div>
  )
}

export default function App(props: AppPropsWithLayout) {
  return (
    <ErrorBoundary>
      <SwitchLanguageProvider>
        <AppContent {...props} />
      </SwitchLanguageProvider>
    </ErrorBoundary>
  )
}
