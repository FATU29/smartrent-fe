import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { AiService } from '@/api/services/ai.service'
import type { ChatMessage, ChatListing } from '@/api/types/ai.type'
import { useChatSession } from './useChatSession'
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
}

export type TChatState = {
  messages: TChatMessage[]
  isLoading: boolean
  isTyping: boolean
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

  const scrollRef = useRef<HTMLDivElement>(null)

  const generateMessageId = useCallback(() => {
    const timestamp = Date.now()
    const randomBytes = new Uint8Array(8)
    crypto.getRandomValues(randomBytes)
    const random = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return `msg-${timestamp}-${random}`
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)
    }
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
        scrollToBottom()
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

      try {
        const response = await AiService.chat({
          messages: conversationHistory,
        })

        const chatResponse = response.data

        const aiMessage = chatResponse?.message
        const listings = chatResponse?.listings

        if (!aiMessage || !aiMessage.content) {
          const errorMessage: TChatMessage = {
            id: generateMessageId(),
            content:
              locale === 'vi'
                ? 'Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.'
                : 'Sorry, an error occurred while processing your request. Please try again later.',
            sender: 'bot',
            timestamp: new Date(),
          }

          setIsTyping(false)
          setIsLoading(false)
          addMessage(errorMessage)
          scrollToBottom()
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
        scrollToBottom()
      } catch (error: unknown) {
        // Handle network errors or actual exceptions
        console.error('[useChatLogic] Chat API error:', error)

        const isUnauthorized =
          (error as { response?: { status?: number }; status?: number })
            ?.response?.status === 401 ||
          (error as { response?: { status?: number }; status?: number })
            ?.status === 401

        const errorMessage: TChatMessage = {
          id: generateMessageId(),
          content: isUnauthorized
            ? t('loginRequired')
            : locale === 'vi'
              ? 'Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.'
              : 'Sorry, an error occurred while processing your request. Please try again later.',
          sender: 'bot',
          timestamp: new Date(),
        }

        setIsTyping(false)
        setIsLoading(false)
        addMessage(errorMessage)
        scrollToBottom()
      }
    },
    [
      isLoading,
      isAuthenticated,
      scrollToBottom,
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

  //Init effect hook
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return {
    messages,
    isLoading,
    isTyping,
    inputValue,
    scrollRef,
    sendMessage,
    handleInputChange,
    clearMessages,
  }
}
