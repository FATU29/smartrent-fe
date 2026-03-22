import { FC } from 'react'
import { useTranslations } from 'next-intl'
import ReactMarkdown from 'react-markdown'

import { cn } from '@/lib/utils'
import { TChatMessage } from '@/hooks/useChatAi'
import { Badge } from '@/components/atoms/badge'

import AiChatAvatar from '@/components/atoms/aiChatAvatar'
import AiChatMessageTime from '@/components/atoms/aiChatMessageTime'
import { CardListingAIMini } from '@/components/molecules/CardListingAIMini'

type TAiChatBubbleProps = {
  message: TChatMessage
  className?: string
}

const AiChatBubble: FC<TAiChatBubbleProps> = ({ message, className }) => {
  const isBot = message.sender === 'bot'
  const hasListings = isBot && message.listings && message.listings.length > 0
  const t = useTranslations('chat')

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
              ? 'bg-muted text-foreground hover:bg-muted/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          {isBot ? (
            <div className='prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-semibold [&>h2]:font-semibold [&>h3]:font-semibold [&>h1]:my-1 [&>h2]:my-1 [&>h3]:my-1'>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
              {message.content}
            </p>
          )}
        </div>

        <AiChatMessageTime timestamp={message.timestamp} className='px-1' />

        {/* Listings Section - Only for bot messages with listings */}
        {hasListings && (
          <div className='w-full space-y-2 mt-1'>
            <Badge variant='secondary' className='text-xs'>
              {message.totalCount || message.listings?.length || 0}{' '}
              {t('foundListings')}
            </Badge>

            <div className='flex flex-col gap-2 w-full'>
              {message.listings?.map((listing) => {
                // Find AI ranking for this listing
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
          </div>
        )}
      </div>

      {!isBot && <AiChatAvatar type='user' className='mt-0.5' />}
    </div>
  )
}

export default AiChatBubble
