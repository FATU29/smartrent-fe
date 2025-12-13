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
 * Checks if a string is a valid non-empty value
 * @param value - The value to check
 * @returns true if value is a valid non-empty string
 */
function isValidString(value?: string | null): value is string {
  if (value === undefined || value === null) return false
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return (
    trimmed.length > 0 &&
    trimmed !== 'undefined' &&
    trimmed !== 'null' &&
    trimmed !== 'NaN'
  )
}

/**
 * Converts a relative or absolute path to an absolute URL
 * @param path - The path to convert
 * @returns Absolute URL or undefined if path is invalid
 */
function toAbsoluteUrl(path?: string | null): string | undefined {
  if (!isValidString(path)) return undefined

  const trimmedPath = path.trim()
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath
  }

  const base = ENV.SITE_URL?.trim().replace(/\/$/, '')
  if (!isValidString(base)) return undefined

  const normalizedPath = trimmedPath.startsWith('/')
    ? trimmedPath
    : `/${trimmedPath}`
  return `${base}${normalizedPath}`
}

/**
 * Validates and sanitizes image URL
 */
function isValidImageUrl(url?: string | null): url is string {
  if (!isValidString(url)) return false

  // Check if it's a valid URL format
  try {
    const trimmedUrl = url.trim()
    // Try parsing as absolute URL first
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      new URL(trimmedUrl)
      return true
    }
    // Try parsing as relative URL
    new URL(trimmedUrl, 'https://example.com')
    return true
  } catch {
    return false
  }
}

export default function SeoHead(props: SeoProps = {}) {
  const router = useRouter()

  const fallbackPath = isValidString(router.asPath) ? router.asPath : '/'
  const canonicalUrl = toAbsoluteUrl(
    isValidString(props.canonical) ? props.canonical : fallbackPath,
  )
  const title = isValidString(props.title) ? props.title : DEFAULTS.title
  const description = isValidString(props.description)
    ? props.description
    : DEFAULTS.description

  // Open Graph with validation
  const og = props.openGraph || {}
  const ogTitle = isValidString(og.title) ? og.title : title
  const ogDesc = isValidString(og.description) ? og.description : description
  const ogUrl = toAbsoluteUrl(og.url) || canonicalUrl
  const siteName = isValidString(og.siteName)
    ? og.siteName
    : isValidString(ENV.SITE_NAME)
      ? ENV.SITE_NAME
      : DEFAULTS.siteName
  const ogType = og.type || 'website'

  // Process and validate Open Graph images
  // Double-check to ensure no undefined values slip through
  const images = (Array.isArray(og.images) ? og.images : [])
    .filter(
      (img) =>
        img &&
        typeof img === 'object' &&
        'url' in img &&
        isValidImageUrl(img.url),
    )
    .map((img) => {
      // Additional safety check
      if (!img || typeof img !== 'object' || !isValidImageUrl(img.url)) {
        return null
      }
      const absoluteUrl = toAbsoluteUrl(img.url)
      // Ensure absoluteUrl is valid before returning
      if (!absoluteUrl || !isValidString(absoluteUrl)) {
        return null
      }
      return { ...img, url: absoluteUrl }
    })
    .filter((img): img is NonNullable<typeof img> => img !== null)
    .slice(0, 4) // Limit to 4 images as per Open Graph spec

  // Twitter Card with validation
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
      {images
        .filter((img) => img && isValidString(img.url))
        .map((img, idx) => (
          <meta key={`og:image:${idx}`} property='og:image' content={img.url} />
        ))}
      {images[0] && isValidString(images[0].url) && (
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
          {isValidString(images[0].alt) && (
            <meta property='og:image:alt' content={images[0].alt} />
          )}
          <meta property='og:image:type' content='image/jpeg' />
        </>
      )}

      {/* Twitter Card */}
      <meta name='twitter:card' content={twitterCard} />
      <meta name='twitter:title' content={ogTitle} />
      <meta name='twitter:description' content={ogDesc} />
      {images[0]?.url && isValidString(images[0].url) && (
        <meta name='twitter:image' content={images[0].url} />
      )}
      {isValidString(twitter.site) && (
        <meta name='twitter:site' content={twitter.site} />
      )}
      {isValidString(twitter.creator) && (
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
