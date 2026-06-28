import { Html, Head, Main, NextScript } from 'next/document'
import { fontVariables } from '@/theme/fonts'

const IMAGE_REMOTE_HOST = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOST
const API_BASE = process.env.NEXT_PUBLIC_URL_API_BASE
const API_AI = process.env.NEXT_PUBLIC_URL_API_AI

// Static origins always worth warming up — image CDNs and Google Maps.
const STATIC_PRECONNECT_ORIGINS = [
  'https://res.cloudinary.com',
  'https://imagedelivery.net',
  'https://cdn.thuenhatro.net',
  'https://pub-444e165e3cc34721a5620508f66c58b0.r2.dev',
  'https://lh3.googleusercontent.com',
]

const STATIC_DNS_PREFETCH_ORIGINS = [
  'https://maps.googleapis.com',
  'https://maps.gstatic.com',
]

function originOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

export default function Document() {
  const dynamicOrigins = [
    originOf(API_BASE),
    originOf(API_AI),
    IMAGE_REMOTE_HOST ? `https://${IMAGE_REMOTE_HOST}` : null,
  ].filter((origin): origin is string => Boolean(origin))

  // De-duplicate so the same origin doesn't get two preconnect hints.
  const preconnectOrigins = Array.from(
    new Set([...STATIC_PRECONNECT_ORIGINS, ...dynamicOrigins]),
  )

  return (
    <Html lang='vi' data-scroll-behavior='smooth'>
      <Head>
        <meta
          name='theme-color'
          content='#ffffff'
          media='(prefers-color-scheme: light)'
        />
        <meta
          name='theme-color'
          content='#1a1d2e'
          media='(prefers-color-scheme: dark)'
        />
        <meta
          name='google-site-verification'
          content='k_QMBVsA1j9RsDzbW9KBzxL6Dc9wa0vNWlVxGyh3zwU'
        />

        {/* Favicon and Icons */}
        <link rel='icon' href='/images/logo-smartrent.jpg' sizes='any' />
        <link
          rel='icon'
          type='image/svg+xml'
          href='/images/logo-smartrent.jpg'
        />
        <link rel='apple-touch-icon' href='/images/logo-smartrent.jpg' />

        {/* Font origins — preconnect for the critical render path */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />

        {/* Image CDNs and API origins — warm the connection so the first
            image/request doesn't pay the DNS + TLS round trip. */}
        {preconnectOrigins.map((origin) => (
          <link
            key={`pc-${origin}`}
            rel='preconnect'
            href={origin}
            crossOrigin='anonymous'
          />
        ))}
        {STATIC_DNS_PREFETCH_ORIGINS.map((origin) => (
          <link key={`dp-${origin}`} rel='dns-prefetch' href={origin} />
        ))}
      </Head>
      <body className={`${fontVariables} antialiased`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
