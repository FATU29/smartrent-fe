import Head from 'next/head'
import { useRouter } from 'next/router'
import { ENV } from '@/constants'
import type { SeoProps } from '@/types/seo.types'

const DEFAULTS = {
  title: 'SmartRent',
  description: 'SmartRent - Find and manage rentals smarter and faster.',
}

function toAbsoluteUrl(path?: string) {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  const base = ENV.SITE_URL?.replace(/\/$/, '') || ''
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export default function SeoHead(props: SeoProps = {}) {
  const router = useRouter()
  const url = toAbsoluteUrl(props.canonical || router.asPath)
  const title = props.title || DEFAULTS.title
  const description = props.description || DEFAULTS.description

  const og = props.openGraph || {}
  const ogTitle = og.title || title
  const ogDesc = og.description || description
  const ogUrl = toAbsoluteUrl(og.url || url)

  const siteName = og.siteName || ENV.SITE_NAME || 'SmartRent'

  const images = (og.images || []).map((img) => ({
    ...img,
    url: toAbsoluteUrl(img.url) || '',
  }))

  const twitter = props.twitter || {}
  const twitterCard = twitter.card || 'summary_large_image'

  return (
    <Head>
      <title>{title}</title>
      {description && <meta name='description' content={description} />}
      {props.noindex && <meta name='robots' content='noindex,nofollow' />}
      {url && <link rel='canonical' href={url} />}

      {/* Open Graph */}
      <meta property='og:type' content={og.type || 'website'} />
      {ogTitle && <meta property='og:title' content={ogTitle} />}
      {ogDesc && <meta property='og:description' content={ogDesc} />}
      {ogUrl && <meta property='og:url' content={ogUrl} />}
      {siteName && <meta property='og:site_name' content={siteName} />}
      {images.slice(0, 4).map((img, idx) => (
        <meta key={`og:image:${idx}`} property='og:image' content={img.url} />
      ))}
      {images[0]?.width && (
        <meta property='og:image:width' content={String(images[0].width)} />
      )}
      {images[0]?.height && (
        <meta property='og:image:height' content={String(images[0].height)} />
      )}
      {images[0]?.alt && (
        <meta property='og:image:alt' content={images[0].alt as string} />
      )}

      {/* Twitter */}
      <meta name='twitter:card' content={twitterCard} />
      {twitter.site && <meta name='twitter:site' content={twitter.site} />}
      {twitter.creator && (
        <meta name='twitter:creator' content={twitter.creator} />
      )}
    </Head>
  )
}
