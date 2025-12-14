import { useState, useEffect, useCallback } from 'react'

import type { TChatMessage } from './useChatLogic'

const CHAT_SESSION_KEY = 'smart-rent-ai-chat-session'

export const useChatSession = (initialMessage: TChatMessage) => {
  const [sessionMessages, setSessionMessages] = useState<TChatMessage[]>(() => {
    try {
      const savedSession = sessionStorage.getItem(CHAT_SESSION_KEY)
      if (savedSession) {
        const parsedMessages = JSON.parse(savedSession) as TChatMessage[]

        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        }
      }
    } catch {
      sessionStorage.removeItem(CHAT_SESSION_KEY)
    }

    return [initialMessage]
  })

  useEffect(() => {
    try {
      if (sessionMessages.length > 0) {
        sessionStorage.setItem(
          CHAT_SESSION_KEY,
          JSON.stringify(sessionMessages),
        )
      }
    } catch {
      // Silent fail - session storage might be full or unavailable
    }
  }, [sessionMessages])

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(CHAT_SESSION_KEY)
      setSessionMessages([initialMessage])
    } catch {
      // Silent fail
    }
  }, [initialMessage])

  const addMessage = useCallback((message: TChatMessage) => {
    setSessionMessages((prev) => {
      const ids = prev.map((m) => m.id)
      if (ids.includes(message.id)) {
        return prev
      }
      return [...prev, message]
    })
  }, [])

  const setMessages = useCallback((messages: TChatMessage[]) => {
    setSessionMessages(messages)
  }, [])

  return {
    messages: sessionMessages,
    addMessage,
    setMessages,
    clearSession,
  }
}
