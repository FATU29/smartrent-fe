import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Encapsulates all scroll behavior for the chat interface.
 * Uses IntersectionObserver for passive bottom-detection (no onScroll perf
 * cost) and scrollIntoView for reliable, native scroll positioning.
 *
 * Send-time UX: the just-sent message is anchored near the top of the
 * viewport (ChatGPT/Claude style). A dynamic bottom spacer (`reservedSpace`)
 * provides the scrollable room a short turn needs to reach the top, then
 * shrinks to fit once the turn completes.
 */
export const useChatScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Id of the message currently anchored to the top, so finalize can measure
  // the completed turn without the caller re-supplying it.
  const anchoredIdRef = useRef<string | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [reservedSpace, setReservedSpace] = useState(0)

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

  // Scroll to the start of a specific message (used by the login-required and
  // non-streaming fallback error paths).
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

  // Scroll to absolute bottom (scroll-to-bottom button).
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior })
    })
  }, [])

  // Anchor a just-sent message to the top of the viewport, reserving a
  // viewport's worth of space below so even a short turn can scroll up.
  const anchorMessageToTop = useCallback((messageId: string) => {
    const container = scrollRef.current
    if (!container) return
    anchoredIdRef.current = messageId
    setReservedSpace(container.clientHeight)
    requestAnimationFrame(() => {
      const el = container.querySelector(`[data-message-id="${messageId}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }, [])

  // Once the turn is complete (or cancelled), shrink the reserved spacer to
  // just enough to hold the anchored message at the top — no excess blank
  // tail. Drop it entirely when the turn already fills the viewport. Targets
  // the message last passed to `anchorMessageToTop`; the turn spans from it to
  // the bottom of the rendered content.
  const finalizeReservedSpace = useCallback(() => {
    requestAnimationFrame(() => {
      const container = scrollRef.current
      const content = contentRef.current
      const id = anchoredIdRef.current
      const anchor = id
        ? container?.querySelector<HTMLElement>(`[data-message-id="${id}"]`)
        : null
      if (!container || !content || !anchor) {
        setReservedSpace(0)
        return
      }
      const turnHeight =
        content.getBoundingClientRect().bottom -
        anchor.getBoundingClientRect().top
      setReservedSpace(Math.max(0, container.clientHeight - turnHeight))
    })
  }, [])

  return {
    scrollRef,
    bottomRef,
    contentRef,
    isAtBottom,
    reservedSpace,
    scrollToMessage,
    scrollToBottom,
    anchorMessageToTop,
    finalizeReservedSpace,
  }
}
