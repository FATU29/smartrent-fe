import '@/styles/globals.css'
import '@/styles/reset.scss'
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

const messages = {
  vi,
  en,
}

function AppContent({ Component, pageProps }: AppPropsWithLayout) {
  const { language } = useSwitchLanguage()
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <div className={fontVariables}>
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
                {getLayout(<Component {...pageProps} />)}
                <Toaster />
              </AuthDialogProvider>
            </AuthProvider>
          </ThemeDataProvider>
        </NextThemesProvider>
      </NextIntlClientProvider>
    </div>
  )
}

export default function App(props: AppPropsWithLayout) {
  return (
    <SwitchLanguageProvider>
      <AppContent {...props} />
    </SwitchLanguageProvider>
  )
}
