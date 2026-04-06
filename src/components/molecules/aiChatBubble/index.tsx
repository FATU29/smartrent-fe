import React, { FC, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { Maximize2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { TChatMessage } from '@/hooks/useChatAi'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog'

import AiChatAvatar from '@/components/atoms/aiChatAvatar'
import AiChatMessageTime from '@/components/atoms/aiChatMessageTime'
import { CardListingAIMini } from '@/components/molecules/CardListingAIMini'
import { CardListingAIDetail } from '@/components/molecules/CardListingAIDetail'
import AiChatCompare from '@/components/molecules/aiChatCompare'
import AiChatContactCard from '@/components/molecules/aiChatContactCard'

type TAiChatBubbleProps = {
  message: TChatMessage
  className?: string
}

// Convert [Mã tin: xxx] to clickable links
const processListingIds = (text: string): string => {
  return text.replace(
    /\[Mã tin:\s*([^\]]{1,50})\]/g,
    (_, id) => `[Mã tin: ${id.trim()}](/listing-detail/${id.trim()})`,
  )
}

// Convert phone numbers to tel: links
const processPhoneNumbers = (text: string): string => {
  return text.replace(
    /(?:SĐT|Điện thoại|Phone|Tel)[:\s]*(\+?[\d\s.-]{9,15})/gi,
    (match, phone) => {
      const cleanPhone = phone.replace(/[\s.-]/g, '').trim()
      return match.replace(phone, `[${phone.trim()}](tel:${cleanPhone})`)
    },
  )
}

const processContent = (text: string): string => {
  let processed = processListingIds(text)
  processed = processPhoneNumbers(processed)
  return processed
}

// Detect if markdown contains a table
const hasMarkdownTable = (text: string): boolean => {
  // Match markdown table pattern: line with | separators followed by alignment row
  return /\|[^|\r\n]+\|[\r\n]+\|[\s:|-]+\|/m.test(text)
}

// Shared link renderer
const renderLink = (
  href: string | undefined,
  children: React.ReactNode,
  props: Record<string, unknown>,
) => {
  if (href?.startsWith('tel:')) {
    return (
      <a
        href={href}
        className='text-primary font-medium hover:underline'
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        📞 {children}
      </a>
    )
  }
  if (href?.startsWith('/listing-detail/')) {
    return (
      <Link
        href={href}
        target='_blank'
        className='text-primary font-medium hover:underline'
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Link>
    )
  }
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary hover:underline'
      {...props}
    >
      {children}
    </a>
  )
}

// Base markdown components for tables (used when no table hiding needed)
const baseTableComponents: Partial<Components> = {
  table: ({ children, ...props }) => (
    <div className='relative my-2 rounded-lg border border-border/50'>
      <div className='overflow-x-auto scrollbar-thin'>
        <table
          className='w-full text-xs border-collapse min-w-[300px]'
          {...props}
        >
          {children}
        </table>
      </div>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className='bg-muted/60' {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className='px-2 py-1.5 text-left font-semibold text-foreground border-b border-border/50'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className='px-2 py-1.5 text-muted-foreground border-b border-border/30'
      {...props}
    >
      {children}
    </td>
  ),
  tr: ({ children, ...props }) => (
    <tr className='hover:bg-muted/30 transition-colors' {...props}>
      {children}
    </tr>
  ),
}

// Hidden table components: table stripped from bubble, shown only in expand dialog
const hiddenTableComponents: Partial<Components> = {
  table: () => null,
  thead: () => null,
  tbody: () => null,
  th: () => null,
  td: () => null,
  tr: () => null,
}

// Full-width markdown components for expand dialog (larger text, more padding)
const dialogMarkdownComponents: Components = {
  a: ({ href, children, ...props }) => renderLink(href, children, props),
  table: ({ children, ...props }) => (
    <div className='my-3 rounded-lg border border-border/50 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm border-collapse' {...props}>
          {children}
        </table>
      </div>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className='bg-muted/60' {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className='px-3 py-2 text-left font-semibold text-foreground border-b border-border/50 whitespace-nowrap'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className='px-3 py-2 text-foreground border-b border-border/30'
      {...props}
    >
      {children}
    </td>
  ),
  tr: ({ children, ...props }) => (
    <tr className='hover:bg-muted/30 transition-colors' {...props}>
      {children}
    </tr>
  ),
}

const INITIAL_SEARCH_RESULTS = 3

const AiChatBubble: FC<TAiChatBubbleProps> = ({ message, className }) => {
  const isBot = message.sender === 'bot'
  const hasListings = isBot && message.listings && message.listings.length > 0
  const t = useTranslations('chat')
  const tAi = useTranslations('aiChat')
  const tools = message.toolsUsed || []
  const [showAllResults, setShowAllResults] = useState(false)
  const [showExpandDialog, setShowExpandDialog] = useState(false)

  // Process bot message content
  const processedContent = useMemo(() => {
    if (!isBot) return message.content
    return processContent(message.content)
  }, [isBot, message.content])

  // Detect if message contains a markdown table (for expand button)
  const containsTable = useMemo(
    () => isBot && hasMarkdownTable(message.content),
    [isBot, message.content],
  )

  // Dynamic bubble markdown components: hide table when expand dialog available
  const bubbleMarkdownComponents = useMemo<Components>(
    () => ({
      a: ({ href, children, ...props }) => renderLink(href, children, props),
      ...(containsTable ? hiddenTableComponents : baseTableComponents),
    }),
    [containsTable],
  )

  const listingDisplayMode = useMemo(() => {
    if (!hasListings) return 'none'
    const isDetail = tools.includes('get_listing_detail')
    const isSearch = tools.includes('search_listings')
    const isPriceEstimate = tools.includes('get_price_estimate')
    const listingCount = message.listings?.length || 0

    if (isDetail && listingCount >= 2) return 'compare'
    if (isDetail || isPriceEstimate) return 'detail'
    if (isSearch) return 'search'
    return 'search' // fallback
  }, [hasListings, tools, message.listings?.length])

  return (
    <div
      className={cn(
        'flex w-full gap-2 px-3 py-1.5 md:gap-3 md:px-4 md:py-2',
        isBot ? 'justify-start' : 'justify-end',
        className,
      )}
    >
      {isBot && <AiChatAvatar type='bot' className='mt-0.5' />}

      <div
        className={cn(
          'flex flex-col gap-2',
          isBot
            ? 'items-start max-w-[90%]'
            : 'items-end max-w-[80%] md:max-w-[75%]',
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 shadow-sm transition-all duration-200 md:px-4',
            isBot
              ? 'bg-muted text-foreground hover:bg-muted/80 break-words overflow-hidden'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 overflow-hidden',
          )}
        >
          {isBot ? (
            <div className='prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-semibold [&>h2]:font-semibold [&>h3]:font-semibold [&>h1]:my-1 [&>h2]:my-1 [&>h3]:my-1'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={bubbleMarkdownComponents}
              >
                {processedContent}
              </ReactMarkdown>
            </div>
          ) : (
            <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
              {message.content}
            </p>
          )}
        </div>

        {/* Expand button - shown when message contains a markdown table */}
        {containsTable && (
          <Button
            variant='ghost'
            size='sm'
            className='h-7 px-2 text-xs text-primary hover:text-primary gap-1'
            onClick={() => setShowExpandDialog(true)}
          >
            <Maximize2 className='w-3 h-3' />
            {tAi('expandTable')}
          </Button>
        )}

        <AiChatMessageTime timestamp={message.timestamp} className='px-1' />

        {/* Listings Section - Skip when AI already rendered a markdown table comparison */}
        {hasListings &&
          !containsTable &&
          listingDisplayMode === 'search' &&
          (() => {
            const listings = message.listings || []
            const hasMore = listings.length > INITIAL_SEARCH_RESULTS
            const visibleListings = showAllResults
              ? listings
              : listings.slice(0, INITIAL_SEARCH_RESULTS)

            return (
              <div className='w-full space-y-2 mt-1'>
                <Badge variant='secondary' className='text-xs'>
                  {message.totalCount || listings.length} {t('foundListings')}
                </Badge>
                <div className='flex flex-col gap-2 w-full'>
                  {visibleListings.map((listing) => {
                    const ranking = message.aiRankings?.find(
                      (r) => r.listingId === listing.listingId,
                    )
                    return (
                      <CardListingAIMini
                        key={listing.listingId}
                        listing={listing}
                        ranking={ranking}
                        variant='compact'
                      />
                    )
                  })}
                </div>
                {hasMore && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full text-xs h-7 text-primary hover:text-primary'
                    onClick={() => setShowAllResults((prev) => !prev)}
                  >
                    {showAllResults
                      ? t('showLess')
                      : t('showMore', {
                          count: listings.length - INITIAL_SEARCH_RESULTS,
                        })}
                  </Button>
                )}
              </div>
            )
          })()}

        {hasListings && !containsTable && listingDisplayMode === 'detail' && (
          <div className='w-full space-y-2 mt-1'>
            {message.listings?.map((listing) => (
              <React.Fragment key={listing.listingId}>
                {listing.user && <AiChatContactCard listing={listing} />}
                <CardListingAIDetail listing={listing} compact />
              </React.Fragment>
            ))}
          </div>
        )}

        {hasListings && !containsTable && listingDisplayMode === 'compare' && (
          <div className='w-full mt-1'>
            <AiChatCompare listings={message.listings!} />
          </div>
        )}
      </div>

      {!isBot && <AiChatAvatar type='user' className='mt-0.5' />}

      {/* Expand Dialog - full-width view for messages with tables */}
      {containsTable && (
        <Dialog open={showExpandDialog} onOpenChange={setShowExpandDialog}>
          <DialogContent className='w-[95vw] max-w-6xl p-0 overflow-hidden'>
            <DialogHeader className='px-5 pt-5 pb-0'>
              <DialogTitle className='text-base font-semibold'>
                {tAi('expandTableTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className='max-h-[80vh] overflow-y-auto px-5 pb-5'>
              <div className='prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>p]:my-2'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={dialogMarkdownComponents}
                >
                  {processedContent}
                </ReactMarkdown>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default AiChatBubble
