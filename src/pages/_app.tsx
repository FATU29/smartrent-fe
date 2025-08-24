import '@/styles/globals.css'
import '@/styles/reset.scss'
import ThemeDataProvider from '@/contexts/useTheme'
import type { AppProps } from 'next/app'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import SwitchLanguageProvider, {
  useSwitchLanguage,
} from '@/contexts/useSwitchLanguage'
import { Locale } from '@/types'
import vi from '@/messages/vi.json'
import en from '@/messages/en.json'

const messages = {
  vi,
  en,
}

function AppContent({ Component, pageProps }: AppProps) {
  const { language } = useSwitchLanguage()

  return (
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
          <Component {...pageProps} />
        </ThemeDataProvider>
      </NextThemesProvider>
    </NextIntlClientProvider>
  )
}

export default function App(props: AppProps) {
  return (
    <SwitchLanguageProvider>
      <AppContent {...props} />
    </SwitchLanguageProvider>
  )
}
