import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'

import { AI_CHAT_RESPONSES } from '@/mock/aiChat'

export type TChatMessage = {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export type TChatState = {
  messages: TChatMessage[]
  isLoading: boolean
  isTyping: boolean
}

export const useChatLogic = () => {
  //Init use hook
  const locale = useLocale() as 'vi' | 'en'

  //Init state hook
  const [messages, setMessages] = useState<TChatMessage[]>([
    {
      id: '1',
      content: AI_CHAT_RESPONSES.welcome[locale],
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const messageIdCounter = useRef(2)
  const scrollRef = useRef<HTMLDivElement>(null)

  //Init util function
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

  const generateBotResponse = useCallback(
    (userMessage: string): string => {
      const lowerMessage = userMessage.toLowerCase()

      if (lowerMessage.includes('giá') || lowerMessage.includes('price')) {
        return AI_CHAT_RESPONSES.pricing[locale]
      }

      if (
        lowerMessage.includes('tìm') ||
        lowerMessage.includes('search') ||
        lowerMessage.includes('phòng')
      ) {
        return AI_CHAT_RESPONSES.search[locale]
      }

      if (
        lowerMessage.includes('đăng tin') ||
        lowerMessage.includes('post') ||
        lowerMessage.includes('cho thuê')
      ) {
        return AI_CHAT_RESPONSES.posting[locale]
      }

      if (
        lowerMessage.includes('liên hệ') ||
        lowerMessage.includes('contact')
      ) {
        return AI_CHAT_RESPONSES.contact[locale]
      }

      if (
        lowerMessage.includes('cảm ơn') ||
        lowerMessage.includes('thank') ||
        lowerMessage.includes('thanks')
      ) {
        return AI_CHAT_RESPONSES.thanks[locale]
      }

      return AI_CHAT_RESPONSES.default[locale]
    },
    [locale],
  )

  //Init event handle
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const trimmedContent = content.trim()

      // Add user message
      const userMessage: TChatMessage = {
        id: String(messageIdCounter.current++),
        content: trimmedContent,
        sender: 'user',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)
      setIsTyping(true)

      scrollToBottom()

      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000),
      )

      // Generate bot response
      const botResponseContent = generateBotResponse(trimmedContent)

      const botMessage: TChatMessage = {
        id: String(messageIdCounter.current++),
        content: botResponseContent,
        sender: 'bot',
        timestamp: new Date(),
      }

      setIsTyping(false)
      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)

      scrollToBottom()
    },
    [isLoading, generateBotResponse, scrollToBottom],
  )

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: AI_CHAT_RESPONSES.welcome[locale],
        sender: 'bot',
        timestamp: new Date(),
      },
    ])
    messageIdCounter.current = 2
  }, [locale])

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
