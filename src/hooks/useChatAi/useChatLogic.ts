import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { AiService } from '@/api/services/ai.service'
import { streamChat } from '@/api/services/chatbot.service'
import type {
  ChatMessage,
  ChatListing,
  ChatSuggestion,
  LastListingRef,
  ChatStreamStatusPayload,
} from '@/api/types/ai.type'
import { ENV } from '@/constants'
import { useChatSession } from './useChatSession'
import { useChatScroll } from './useChatScroll'
import { useGuestChatQuota, GUEST_MESSAGE_LIMIT } from './useGuestChatQuota'
import { useAuth } from '@/hooks/useAuth'

// Stable id for the one-shot login CTA shown once a guest hits the message
// limit. A fixed id makes addMessage dedupe it (idempotent across renders).
const GUEST_LIMIT_CTA_ID = 'guest-limit-cta'

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
  suggestions?: ChatSuggestion[]
  /** Marks a bot message that should render an inline action button (e.g. the
   *  guest login CTA shown after the free message limit is reached). */
  action?: 'login'
  /** True while this bot message is still receiving streamed text deltas. The
   *  bubble renders plain text during streaming and defers markdown parsing
   *  until the stream settles, avoiding a full re-parse on every token. */
  isStreaming?: boolean
}

export type TChatState = {
  messages: TChatMessage[]
  isLoading: boolean
  isTyping: boolean
}

export type TStreamingStatus = {
  phase: ChatStreamStatusPayload['phase']
  tool?: string
  /** BE-generated localised label for the tool_call phase (preferred over getToolLabel). */
  summary?: string
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

  // Guest message allowance: a logged-out visitor may send a few messages
  // before the chat is gated behind login.
  const { limitReached: guestLimitReached, increment: incrementGuestQuota } =
    useGuestChatQuota(isAuthenticated)

  // Initialize with welcome message + curated starter suggestions so a fresh
  // chat offers one-tap entry points (the backend only sends suggestions after
  // a real turn). Stored as plain strings in i18n; label === query here.
  const initialMessage: TChatMessage = useMemo(() => {
    const starters = (t.raw('starterSuggestions') as string[]).map((s) => ({
      label: s,
      query: s,
    }))
    return {
      id: 'welcome-msg-initial',
      content:
        locale === 'vi'
          ? 'Xin chào! Tôi là trợ lý AI của Thuê Nhà Trọ. Tôi có thể giúp bạn tìm kiếm phòng trọ, căn hộ phù hợp với nhu cầu của bạn. Bạn cần tìm loại hình bất động sản nào?'
          : 'Hello! I am SmartRent AI assistant. I can help you find rooms and apartments that suit your needs. What type of property are you looking for?',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: starters,
    }
  }, [locale, t])

  // Use session storage for message persistence. Passing the auth identity in
  // lets the session wipe itself on login / logout / account switch instead of
  // leaking one account's chat into the next.
  const { messages, addMessage, updateMessage, clearSession } = useChatSession(
    initialMessage,
    { isAuthenticated, userId: user?.userId ?? null },
  )

  //Init state hook
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [streamingStatus, setStreamingStatus] = useState<TStreamingStatus>(null)

  const abortRef = useRef<AbortController | null>(null)

  const {
    scrollRef,
    bottomRef,
    contentRef,
    isAtBottom,
    reservedSpace,
    scrollToMessage,
    scrollToBottom,
    anchorMessageToTop,
    finalizeReservedSpace,
  } = useChatScroll()

  // Abort any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // Once a guest exhausts their free messages, surface a one-shot login CTA in
  // the transcript (and scroll to it). Deferred until the stream settles so it
  // lands after the final answer rather than mid-stream. addMessage dedupes on
  // the fixed id, so this stays idempotent across renders.
  useEffect(() => {
    if (!guestLimitReached || isLoading) return
    addMessage({
      id: GUEST_LIMIT_CTA_ID,
      content: t('guestLimitReached', { count: GUEST_MESSAGE_LIMIT }),
      sender: 'bot',
      timestamp: new Date(),
      action: 'login',
    })
    scrollToMessage(GUEST_LIMIT_CTA_ID)
  }, [guestLimitReached, isLoading, addMessage, t, scrollToMessage])

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
        // At the limit the input is already disabled; this guards the
        // programmatic path (suggestion clicks, viewListingDetail). The login
        // CTA is surfaced by the effect below, not here.
        if (guestLimitReached) return
        // Under the limit — consume one guest turn and fall through to send.
        incrementGuestQuota()
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

      // Anchor the just-sent message near the top of the viewport (reserving a
      // viewport of space below) so the question stays visible while the
      // answer streams in beneath it.
      anchorMessageToTop(userMessage.id)

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

        const ensureBotMessage = () => {
          if (botMessageAdded) return
          botMessageAdded = true
          addMessage({
            id: botMessageId,
            content: '',
            sender: 'bot',
            timestamp: new Date(),
            isStreaming: true,
          })
          setIsTyping(false)
        }

        try {
          await streamChat(
            {
              ...requestPayload,
              user_id: user?.userId ?? null,
            },
            {
              onStatus: (data) => {
                setStreamingStatus({
                  phase: data.phase,
                  tool: data.tool,
                  summary: data.summary,
                })
              },
              onTextDelta: (delta) => {
                ensureBotMessage()
                updateMessage(botMessageId, (m) => ({
                  ...m,
                  content: m.content + delta,
                }))
              },
              onListings: (payload) => {
                ensureBotMessage()
                updateMessage(botMessageId, (m) => ({
                  ...m,
                  listings: payload.listings,
                  totalCount: payload.totalCount ?? payload.listings.length,
                  aiRankings: payload.aiRankings ?? [],
                }))
              },
              onSuggestions: (payload) => {
                ensureBotMessage()
                updateMessage(botMessageId, (m) => ({
                  ...m,
                  suggestions: payload.items,
                }))
              },
              onDone: (data) => {
                ensureBotMessage()
                const toolsUsed =
                  data.tools_used ?? data.metadata?.tools_used ?? []
                // Settle the message: switch the bubble from plain text to
                // full markdown, and attach tool metadata if any.
                updateMessage(botMessageId, (m) => ({
                  ...m,
                  isStreaming: false,
                  ...(toolsUsed.length > 0 ? { toolsUsed } : {}),
                }))
                setIsTyping(false)
                setIsLoading(false)
                setStreamingStatus(null)
                finalizeReservedSpace()
              },
              onError: (msg) => {
                if (botMessageAdded) {
                  updateMessage(botMessageId, (m) => ({
                    ...m,
                    content: m.content || msg || getChatErrorContent(locale, t),
                    isStreaming: false,
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
                finalizeReservedSpace()
              },
            },
            controller.signal,
          )
        } catch (error: unknown) {
          // Aborts are expected (user cancelled / new send / unmount). Leave
          // the reserved space alone: a new send re-anchors it, and
          // cancelStream finalizes it on its own.
          if ((error as Error)?.name === 'AbortError') {
            // A cancelled / superseded stream leaves its partial bubble mid-
            // stream; settle it so it renders as markdown rather than staying
            // stuck in the plain-text streaming view.
            if (botMessageAdded) {
              updateMessage(botMessageId, (m) => ({ ...m, isStreaming: false }))
            }
            setIsTyping(false)
            setIsLoading(false)
            setStreamingStatus(null)
            return
          }
          // onError handler already updated UI for stream-level errors;
          // anything reaching here is a fatal pre-stream/network failure.
          if (botMessageAdded) {
            updateMessage(botMessageId, (m) => ({ ...m, isStreaming: false }))
          }
          if (isLoading) {
            setIsTyping(false)
            setIsLoading(false)
            setStreamingStatus(null)
          }
          finalizeReservedSpace()
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
          finalizeReservedSpace()
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
        finalizeReservedSpace()
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
        finalizeReservedSpace()
      }
    },
    [
      isLoading,
      isAuthenticated,
      guestLimitReached,
      incrementGuestQuota,
      user?.userId,
      anchorMessageToTop,
      finalizeReservedSpace,
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
    // Collapse the reserved space around whatever partial answer was received
    // so the cancelled turn doesn't leave a viewport of blank tail.
    finalizeReservedSpace()
  }, [finalizeReservedSpace])

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
    guestLimitReached,
    scrollRef,
    bottomRef,
    contentRef,
    isAtBottom,
    reservedSpace,
    scrollToBottom,
    sendMessage,
    viewListingDetail,
    cancelStream,
    handleInputChange,
    clearMessages,
  }
}
