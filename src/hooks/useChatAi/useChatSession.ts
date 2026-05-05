import { useState, useEffect, useCallback, useRef } from 'react'

import type { TChatMessage } from './useChatLogic'

const CHAT_SESSION_KEY = 'smart-rent-ai-chat-session'

// Debounce window for sessionStorage writes. Streaming bot responses can fire
// 50-200 state updates per turn (one per text delta from the SSE stream). A
// synchronous JSON.stringify + sessionStorage.setItem on every delta blocks
// the main thread and causes visible streaming jank. 400ms is short enough
// that closing the tab still captures recent messages on the next pageshow,
// long enough to coalesce a full streaming response into one write.
const PERSIST_DEBOUNCE_MS = 400

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

  // Hold the latest messages in a ref so the persist function can read them
  // without being re-created (and re-scheduled) on every state change.
  const messagesRef = useRef(sessionMessages)
  messagesRef.current = sessionMessages

  useEffect(() => {
    if (sessionMessages.length === 0) return

    const handle = window.setTimeout(() => {
      try {
        sessionStorage.setItem(
          CHAT_SESSION_KEY,
          JSON.stringify(messagesRef.current),
        )
      } catch {
        // Silent fail - session storage might be full or unavailable
      }
    }, PERSIST_DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [sessionMessages])

  // Belt-and-braces: flush on tab hide / pagehide so a stream-in-progress
  // doesn't lose its trailing 400ms when the user closes the tab.
  useEffect(() => {
    const flush = () => {
      try {
        if (messagesRef.current.length > 0) {
          sessionStorage.setItem(
            CHAT_SESSION_KEY,
            JSON.stringify(messagesRef.current),
          )
        }
      } catch {
        // Silent fail
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

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

  const updateMessage = useCallback(
    (id: string, updater: (msg: TChatMessage) => TChatMessage) => {
      setSessionMessages((prev) =>
        prev.map((m) => (m.id === id ? updater(m) : m)),
      )
    },
    [],
  )

  const setMessages = useCallback((messages: TChatMessage[]) => {
    setSessionMessages(messages)
  }, [])

  return {
    messages: sessionMessages,
    addMessage,
    updateMessage,
    setMessages,
    clearSession,
  }
}
