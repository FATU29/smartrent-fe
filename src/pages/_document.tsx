import { Html, Head, Main, NextScript } from 'next/document'
import { fontVariables } from '@/theme/fonts'

export default function Document() {
  return (
    <Html lang='en' data-scroll-behavior='smooth'>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <meta name='theme-color' content='#ffffff' />

        {/* Favicon and Icons */}
        <link rel='icon' href='/images/logo-smartrent.jpg' sizes='any' />
        <link
          rel='icon'
          type='image/svg+xml'
          href='/images/logo-smartrent.jpg'
        />
        <link rel='apple-touch-icon' href='/images/logo-smartrent.jpg' />

        {/* Preconnect to improve performance */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />

        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
      </Head>
      <body className={`${fontVariables} antialiased`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
