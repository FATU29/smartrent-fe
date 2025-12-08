import Head from 'next/head'
import { useRouter } from 'next/router'
import { ENV } from '@/constants'
import type { SeoProps } from '@/types/seo.types'

const DEFAULTS = {
  title: 'SmartRent',
  description: 'SmartRent - Find and manage rentals smarter and faster.',
  siteName: 'SmartRent',
} as const

/**
 * Converts a relative or absolute path to an absolute URL
 * @param path - The path to convert
 * @returns Absolute URL or undefined if path is invalid
 */
function toAbsoluteUrl(path?: string): string | undefined {
  if (!path || path === 'undefined') return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const base = ENV.SITE_URL?.replace(/\/$/, '') || ''
  if (!base) return undefined

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

/**
 * Validates and sanitizes image URL
 */
function isValidImageUrl(url?: string): url is string {
  if (!url || url === 'undefined' || url === 'null') return false
  // Check if it's a valid URL format
  try {
    new URL(url.startsWith('http') ? url : `https://example.com${url}`)
    return true
  } catch {
    return false
  }
}

export default function SeoHead(props: SeoProps = {}) {
  const router = useRouter()

  // Basic meta tags
  const canonicalUrl = toAbsoluteUrl(props.canonical || router.asPath)
  const title = props.title || DEFAULTS.title
  const description = props.description || DEFAULTS.description

  // Open Graph
  const og = props.openGraph || {}
  const ogTitle = og.title || title
  const ogDesc = og.description || description
  const ogUrl = toAbsoluteUrl(og.url) || canonicalUrl
  const siteName = og.siteName || ENV.SITE_NAME || DEFAULTS.siteName
  const ogType = og.type || 'website'

  // Process and validate Open Graph images
  const images = (og.images || [])
    .filter((img) => isValidImageUrl(img.url))
    .map((img) => {
      const absoluteUrl = toAbsoluteUrl(img.url)
      return absoluteUrl ? { ...img, url: absoluteUrl } : null
    })
    .filter((img): img is NonNullable<typeof img> => img !== null)
    .slice(0, 4) // Limit to 4 images as per Open Graph spec

  // Twitter Card
  const twitter = props.twitter || {}
  const twitterCard =
    twitter.card || (images.length > 0 ? 'summary_large_image' : 'summary')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />

      {/* Viewport - Essential for responsive design */}
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, maximum-scale=5'
      />

      {/* Robots */}
      <meta
        name='robots'
        content={props.noindex ? 'noindex,nofollow' : 'index,follow'}
      />

      {/* Canonical URL */}
      {canonicalUrl && <link rel='canonical' href={canonicalUrl} />}

      {/* Language */}
      {router.locale && (
        <meta httpEquiv='content-language' content={router.locale} />
      )}

      {/* Open Graph Protocol */}
      <meta property='og:type' content={ogType} />
      <meta property='og:title' content={ogTitle} />
      <meta property='og:description' content={ogDesc} />
      {ogUrl && <meta property='og:url' content={ogUrl} />}
      <meta property='og:site_name' content={siteName} />
      {router.locale && <meta property='og:locale' content={router.locale} />}

      {/* Open Graph Images */}
      {images.map((img, idx) => (
        <meta key={`og:image:${idx}`} property='og:image' content={img.url} />
      ))}
      {images[0]?.url && (
        <>
          <meta property='og:image:secure_url' content={images[0].url} />
          {images[0].width && (
            <meta property='og:image:width' content={String(images[0].width)} />
          )}
          {images[0].height && (
            <meta
              property='og:image:height'
              content={String(images[0].height)}
            />
          )}
          {images[0].alt && (
            <meta property='og:image:alt' content={images[0].alt as string} />
          )}
          <meta property='og:image:type' content='image/jpeg' />
        </>
      )}

      {/* Twitter Card */}
      <meta name='twitter:card' content={twitterCard} />
      <meta name='twitter:title' content={ogTitle} />
      <meta name='twitter:description' content={ogDesc} />
      {images[0]?.url && <meta name='twitter:image' content={images[0].url} />}
      {twitter.site && <meta name='twitter:site' content={twitter.site} />}
      {twitter.creator && (
        <meta name='twitter:creator' content={twitter.creator} />
      )}

      {/* Additional SEO Meta Tags */}
      <meta name='format-detection' content='telephone=no' />
      <meta name='theme-color' content='#ffffff' />

      {/* Prevent duplicate content */}
      {router.query && Object.keys(router.query).length > 0 && (
        <meta name='referrer' content='strict-origin-when-cross-origin' />
      )}
    </Head>
  )
}
