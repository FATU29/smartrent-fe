import React, { useMemo } from 'react'
import ImageAtom from '@/components/atoms/imageAtom'
import { basePath, DEFAULT_IMAGE } from '@/constants'

// Simple HTML sanitizer for news content
const sanitizeHtml = (html: string): string => {
  const allowedTags = [
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
  ]
  const parser = typeof window !== 'undefined' ? new DOMParser() : null
  if (!parser) return html

  const doc = parser.parseFromString(html, 'text/html')
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
  const nodesToRemove: Node[] = []

  while (walker.nextNode()) {
    const node = walker.currentNode as Element
    if (!allowedTags.includes(node.tagName.toLowerCase())) {
      nodesToRemove.push(node)
    }
  }

  nodesToRemove.forEach((node) => node.parentNode?.removeChild(node))
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
