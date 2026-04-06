import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Encapsulates all scroll behavior for the chat interface.
 * Uses IntersectionObserver for passive bottom-detection (no onScroll perf cost)
 * and scrollIntoView for reliable, native scroll positioning.
 */
export const useChatScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // IntersectionObserver: passively detects if the bottom sentinel is visible
  useEffect(() => {
    const sentinel = bottomRef.current
    const container = scrollRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsAtBottom(entry.isIntersecting),
      { root: container, threshold: 0.1 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Scroll to the start of a specific message (for bot responses)
  const scrollToMessage = useCallback((messageId: string) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector(
        `[data-message-id="${messageId}"]`,
      )
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }, [])

  // Scroll to absolute bottom (for user messages + scroll-to-bottom button)
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  return { scrollRef, bottomRef, isAtBottom, scrollToMessage, scrollToBottom }
}
