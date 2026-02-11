import React, { useMemo } from 'react'
import ImageAtom from '@/components/atoms/imageAtom'
import { basePath, DEFAULT_IMAGE } from '@/constants'

// Simple HTML sanitizer for news content
const allowedTags = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'a',
  'img',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'blockquote',
  'code',
  'pre',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'br',
  'hr',
  'div',
  'span',
])

/** Tags whose entire subtree should be stripped (not just unwrapped). */
const removableTags = new Set(['script', 'style', 'iframe', 'object', 'embed'])

const sanitizeHtml = (html: string): string => {
  if (typeof globalThis.window === 'undefined') return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
  const nodesToProcess: Element[] = []

  while (walker.nextNode()) {
    const node = walker.currentNode as Element
    if (!allowedTags.has(node.tagName.toLowerCase())) {
      nodesToProcess.push(node)
    }
  }

  for (const node of nodesToProcess) {
    if (!node.parentNode) continue

    if (removableTags.has(node.tagName.toLowerCase())) {
      node.remove()
    } else {
      // Unwrap: keep child nodes, remove the disallowed wrapper
      while (node.firstChild) {
        node.parentNode.insertBefore(node.firstChild, node)
      }
      node.remove()
    }
  }

  return doc.body.innerHTML
}

interface NewsDetailContentProps {
  title: string
  content: string
  thumbnailUrl?: string
}

const NewsDetailContent: React.FC<NewsDetailContentProps> = ({
  title,
  content,
  thumbnailUrl,
}) => {
  const imageUrl = thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`
  const sanitizedContent = useMemo(() => sanitizeHtml(content), [content])

  return (
    <>
      {/* Featured Image */}
      <div className='relative aspect-video w-full rounded-2xl overflow-hidden mb-10 shadow-sm ring-1 ring-border/10'>
        <ImageAtom
          src={imageUrl}
          alt={title}
          width={800}
          height={450}
          className='w-full h-full object-cover'
          priority
        />
      </div>

      {/* Article Content */}
      <div
        className='news-article-content max-w-none mb-10'
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  )
}

export default NewsDetailContent
