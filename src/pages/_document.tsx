import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <meta name='theme-color' content='#ffffff' />

        {/* Favicon and Icons */}
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' type='image/svg+xml' href='/svg/default-avatar.svg' />
        <link rel='apple-touch-icon' href='/favicon.ico' />

        {/* Preconnect to improve performance */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
      </Head>
      <body className='antialiased'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
