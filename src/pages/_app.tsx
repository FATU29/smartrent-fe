import '@/styles/globals.css'
import '@/styles/reset.scss'
import '@/styles/listing-detail.css'
import '@/components/molecules/desktopNavigation/navigation.css'
import ThemeDataProvider from '@/contexts/theme'
import AuthProvider from '@/contexts/auth'
import React from 'react'
import type { AppPropsWithLayout } from '@/types/next-page'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import SwitchLanguageProvider from '@/contexts/switchLanguage'
import { Locale } from '@/types'
import vi from '@/messages/vi.json'
import en from '@/messages/en.json'
import { Toaster } from '@/components/atoms/sonner'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'
import { AuthDialogProvider } from '@/contexts/authDialog'
import { fontVariables } from '@/theme/fonts'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthRouteGate from '@/components/utility/AuthRouteGate'
import ErrorBoundary from '@/components/atoms/errorBoundary'
import NextTopLoader from 'nextjs-toploader'
import AiChatWidget from '@/components/organisms/aiChatWidget'
import { useRouter } from 'next/router'

const messages = {
  vi,
  en,
}

const queryClient = new QueryClient()

function AppContent({ Component, pageProps }: AppPropsWithLayout) {
  const { language } = useSwitchLanguage()
  const router = useRouter()
  const getLayout = Component.getLayout ?? ((page) => page)

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

  return (
    <div className={fontVariables}>
      <NextTopLoader
        color='var(--primary)'
        height={3}
        showSpinner={false}
        easing='ease'
        speed={200}
        shadow='0 0 10px var(--primary),0 0 5px var(--primary)'
      />
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider
          locale={language}
          messages={messages[language as Locale]}
        >
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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
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
