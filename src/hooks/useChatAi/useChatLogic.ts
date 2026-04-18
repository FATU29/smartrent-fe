import { useState, useCallback, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { AiService } from '@/api/services/ai.service'
import type {
  ChatMessage,
  ChatListing,
  LastListingRef,
} from '@/api/types/ai.type'
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
  const { isAuthenticated } = useAuth()

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
  const { messages, addMessage, clearSession } = useChatSession(initialMessage)

  //Init state hook
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const { scrollRef, bottomRef, isAtBottom, scrollToMessage, scrollToBottom } =
    useChatScroll()

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

      try {
        const response = await AiService.chat({
          messages: conversationHistory,
          ...(lastListings.length > 0 && { last_listings: lastListings }),
        })

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
      scrollToBottom,
      scrollToMessage,
      messages,
      addMessage,
      generateMessageId,
      locale,
      t,
    ],
  )

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  const clearMessages = useCallback(() => {
    // Clear session storage and reset to initial message
    clearSession()
  }, [clearSession])

  return {
    messages,
    isLoading,
    isTyping,
    inputValue,
    scrollRef,
    bottomRef,
    isAtBottom,
    scrollToBottom,
    sendMessage,
    handleInputChange,
    clearMessages,
  }
}
