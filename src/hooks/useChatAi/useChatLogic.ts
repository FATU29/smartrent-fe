import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { AiService } from '@/api/services/ai.service'
import { streamChat } from '@/api/services/chatbot.service'
import type {
  ChatMessage,
  ChatListing,
  LastListingRef,
  ChatStreamStatusPayload,
} from '@/api/types/ai.type'
import { ENV } from '@/constants'
import { useChatSession } from './useChatSession'
import { useChatScroll } from './useChatScroll'
import { useAuth } from '@/hooks/useAuth'

export type TChatMessage = {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  listings?: ChatListing[]
  totalCount?: number
  aiRankings?: Array<{
    listingId: number
    score: number
    reason: string
  }>
  toolsUsed?: string[]
}

export type TChatState = {
  messages: TChatMessage[]
  isLoading: boolean
  isTyping: boolean
}

export type TStreamingStatus = {
  phase: ChatStreamStatusPayload['phase']
  tool?: string
} | null

function buildLastListings(messages: TChatMessage[]): LastListingRef[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.sender === 'bot' && msg.listings && msg.listings.length > 0) {
      return msg.listings.map((listing, idx) => ({
        position: idx + 1,
        listingId: String(listing.listingId),
        title: listing.title || '',
      }))
    }
  }
  return []
}

function getChatErrorContent(
  locale: string,
  t: (key: string) => string,
  isUnauthorized = false,
): string {
  if (isUnauthorized) return t('loginRequired')
  return locale === 'vi'
    ? 'Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.'
    : 'Sorry, an error occurred while processing your request. Please try again later.'
}

export const useChatLogic = () => {
  //Init use hook
  const locale = useLocale() as 'vi' | 'en'
  const t = useTranslations('aiChat')
  const { isAuthenticated, user } = useAuth()

  // Initialize with welcome message
  const initialMessage: TChatMessage = useMemo(
    () => ({
      id: 'welcome-msg-initial',
      content:
        locale === 'vi'
          ? 'Xin chào! Tôi là trợ lý AI của SmartRent. Tôi có thể giúp bạn tìm kiếm phòng trọ, căn hộ phù hợp với nhu cầu của bạn. Bạn cần tìm loại hình bất động sản nào?'
          : 'Hello! I am SmartRent AI assistant. I can help you find rooms and apartments that suit your needs. What type of property are you looking for?',
      sender: 'bot',
      timestamp: new Date(),
    }),
    [locale],
  )

  // Use session storage for message persistence
  const { messages, addMessage, updateMessage, clearSession } =
    useChatSession(initialMessage)

  //Init state hook
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [streamingStatus, setStreamingStatus] = useState<TStreamingStatus>(null)

  const abortRef = useRef<AbortController | null>(null)

  const { scrollRef, bottomRef, isAtBottom, scrollToMessage, scrollToBottom } =
    useChatScroll()

  // Mirror isAtBottom into a ref so streaming callbacks read the current value
  // without re-creating sendMessage on every scroll change.
  const isAtBottomRef = useRef(isAtBottom)
  useEffect(() => {
    isAtBottomRef.current = isAtBottom
  }, [isAtBottom])

  // Abort any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const generateMessageId = useCallback(() => {
    const timestamp = Date.now()
    const randomBytes = new Uint8Array(8)
    crypto.getRandomValues(randomBytes)
    const random = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return `msg-${timestamp}-${random}`
  }, [])

  //Init event handle
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const trimmedContent = content.trim()

      if (!isAuthenticated) {
        const loginRequiredMessage: TChatMessage = {
          id: generateMessageId(),
          content: t('loginRequired'),
          sender: 'bot',
          timestamp: new Date(),
        }
        addMessage(loginRequiredMessage)
        scrollToMessage(loginRequiredMessage.id)
        return
      }

      // Cancel any prior in-flight stream before starting a new one
      abortRef.current?.abort()

      const userMessage: TChatMessage = {
        id: generateMessageId(),
        content: trimmedContent,
        sender: 'user',
        timestamp: new Date(),
      }

      // Add user message using session method
      addMessage(userMessage)
      setInputValue('')
      setIsLoading(true)
      setIsTyping(true)
      setStreamingStatus(null)

      scrollToBottom()

      const conversationHistory: ChatMessage[] = messages
        .filter((msg) => msg.sender === 'user' || msg.sender === 'bot')
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }))

      conversationHistory.push({
        role: 'user',
        content: trimmedContent,
      })

      // Build last_listings from the most recent bot message that had listings
      const lastListings = buildLastListings(messages)

      const requestPayload = {
        messages: conversationHistory,
        ...(lastListings.length > 0 && { last_listings: lastListings }),
      }

      if (ENV.CHAT_STREAMING_ENABLED) {
        const controller = new AbortController()
        abortRef.current = controller

        const botMessageId = generateMessageId()
        let botMessageAdded = false

        // Scroll-follow: capture user's intent ONCE at stream start. Listen
        // for wheel/touchmove to detect a real user-initiated scroll-up, then
        // back off. rAF wraps the actual scrollTop write so we read
        // scrollHeight AFTER React commits the latest delta.
        const scrollContainer = scrollRef.current
        let followBottom = isAtBottomRef.current
        const handleUserScroll = () => {
          followBottom = false
        }
        scrollContainer?.addEventListener('wheel', handleUserScroll, {
          passive: true,
        })
        scrollContainer?.addEventListener('touchmove', handleUserScroll, {
          passive: true,
        })
        const teardownScrollFollow = () => {
          scrollContainer?.removeEventListener('wheel', handleUserScroll)
          scrollContainer?.removeEventListener('touchmove', handleUserScroll)
        }
        const followScrollToBottom = () => {
          if (!followBottom || !scrollContainer) return
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          })
        }

        const ensureBotMessage = () => {
          if (botMessageAdded) return
          botMessageAdded = true
          addMessage({
            id: botMessageId,
            content: '',
            sender: 'bot',
            timestamp: new Date(),
          })
          setIsTyping(false)
          scrollToMessage(botMessageId)
        }

        try {
          await streamChat(
            {
              ...requestPayload,
              user_id: user?.userId ?? null,
            },
            {
              onStatus: (data) => {
                setStreamingStatus({ phase: data.phase, tool: data.tool })
              },
              onTextDelta: (delta) => {
                ensureBotMessage()
                updateMessage(botMessageId, (m) => ({
                  ...m,
                  content: m.content + delta,
                }))
                followScrollToBottom()
              },
              onListings: (payload) => {
                ensureBotMessage()
                updateMessage(botMessageId, (m) => ({
                  ...m,
                  listings: payload.listings,
                  totalCount: payload.totalCount ?? payload.listings.length,
                  aiRankings: payload.aiRankings ?? [],
                }))
                followScrollToBottom()
              },
              onDone: (data) => {
                ensureBotMessage()
                const toolsUsed =
                  data.tools_used ?? data.metadata?.tools_used ?? []
                if (toolsUsed.length > 0) {
                  updateMessage(botMessageId, (m) => ({ ...m, toolsUsed }))
                }
                setIsTyping(false)
                setIsLoading(false)
                setStreamingStatus(null)
                teardownScrollFollow()
              },
              onError: (msg) => {
                if (botMessageAdded) {
                  updateMessage(botMessageId, (m) => ({
                    ...m,
                    content: m.content || msg || getChatErrorContent(locale, t),
                  }))
                } else {
                  addMessage({
                    id: botMessageId,
                    content: msg || getChatErrorContent(locale, t),
                    sender: 'bot',
                    timestamp: new Date(),
                  })
                }
                setIsTyping(false)
                setIsLoading(false)
                setStreamingStatus(null)
                teardownScrollFollow()
              },
            },
            controller.signal,
          )
        } catch (error: unknown) {
          // Aborts are expected (user cancelled / new send / unmount).
          if ((error as Error)?.name === 'AbortError') {
            setIsTyping(false)
            setIsLoading(false)
            setStreamingStatus(null)
            teardownScrollFollow()
            return
          }
          // onError handler already updated UI for stream-level errors;
          // anything reaching here is a fatal pre-stream/network failure.
          if (isLoading) {
            setIsTyping(false)
            setIsLoading(false)
            setStreamingStatus(null)
          }
          teardownScrollFollow()
          console.error('[useChatLogic] Chat stream error:', error)
        }
        return
      }

      // Fallback: blocking JSON path
      try {
        const response = await AiService.chat(requestPayload)

        const chatResponse = response.data

        const aiMessage = chatResponse?.message
        const listings = chatResponse?.listings
        const toolsUsed = chatResponse?.metadata?.tools_used || []

        if (!aiMessage || !aiMessage.content) {
          const errorMessage: TChatMessage = {
            id: generateMessageId(),
            content: getChatErrorContent(locale, t),
            sender: 'bot',
            timestamp: new Date(),
          }

          setIsTyping(false)
          setIsLoading(false)
          addMessage(errorMessage)
          scrollToMessage(errorMessage.id)
          return
        }
        // Check if listings exist and have data
        const hasListings =
          listings &&
          listings.listings &&
          Array.isArray(listings.listings) &&
          listings.listings.length > 0

        const botMessage: TChatMessage = {
          id: generateMessageId(),
          content: aiMessage.content.trim(),
          sender: 'bot',
          timestamp: new Date(),
          toolsUsed,
          ...(hasListings && {
            listings: listings.listings,
            totalCount: listings.totalCount || listings.listings.length,
            aiRankings: listings.aiRankings || [],
          }),
        }

        setIsTyping(false)
        setIsLoading(false)

        // Add bot message to session (always add, even if no listings)
        addMessage(botMessage)
        scrollToMessage(botMessage.id)
      } catch (error: unknown) {
        // Handle network errors or actual exceptions
        console.error('[useChatLogic] Chat API error:', error)

        const errorStatus = error as {
          response?: { status?: number }
          status?: number
        }
        const isUnauthorized =
          errorStatus?.response?.status === 401 || errorStatus?.status === 401

        const errorMessage: TChatMessage = {
          id: generateMessageId(),
          content: getChatErrorContent(locale, t, isUnauthorized),
          sender: 'bot',
          timestamp: new Date(),
        }

        setIsTyping(false)
        setIsLoading(false)
        addMessage(errorMessage)
        scrollToMessage(errorMessage.id)
      }
    },
    [
      isLoading,
      isAuthenticated,
      user?.userId,
      scrollToBottom,
      scrollToMessage,
      messages,
      addMessage,
      updateMessage,
      generateMessageId,
      locale,
      t,
    ],
  )

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  // Triggers the agent's get_listing_detail tool by sending a natural-language
  // query that includes the listingId in the [Mã tin: X] format the agent's
  // system prompt recognizes. The detail then renders as a normal bot message
  // inline in the chat instead of navigating away to /listing-detail/X.
  const viewListingDetail = useCallback(
    (listingId: number | string) => {
      const query =
        locale === 'vi'
          ? `Xem chi tiết tin [Mã tin: ${listingId}]`
          : `Show me details of listing [Mã tin: ${listingId}]`
      sendMessage(query)
    },
    [locale, sendMessage],
  )

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsTyping(false)
    setIsLoading(false)
    setStreamingStatus(null)
  }, [])

  const clearMessages = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreamingStatus(null)
    // Clear session storage and reset to initial message
    clearSession()
  }, [clearSession])

  return {
    messages,
    isLoading,
    isTyping,
    streamingStatus,
    inputValue,
    scrollRef,
    bottomRef,
    isAtBottom,
    scrollToBottom,
    sendMessage,
    viewListingDetail,
    cancelStream,
    handleInputChange,
    clearMessages,
  }
}
