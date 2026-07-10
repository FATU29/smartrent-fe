import { useState, useEffect, useCallback, useRef } from 'react'

// How many messages an unauthenticated visitor may send before the chat is
// gated behind login. The gate is a frontend UX/conversion control; backend
// per-IP rate limiting is the abuse backstop.
export const GUEST_MESSAGE_LIMIT = 5

const COUNT_KEY = 'smart-rent-ai-guest-msg-count'

/** Clears the guest message counter. Exposed so auth handlers can wipe it on
 *  login/logout even when the chat widget is unmounted (mirrors
 *  clearChatSessionStorage). */
export const clearGuestQuotaStorage = () => {
  try {
    sessionStorage.removeItem(COUNT_KEY)
  } catch {
    // Silent fail - session storage might be unavailable
  }
}

function readStoredCount(): number {
  try {
    const raw = sessionStorage.getItem(COUNT_KEY)
    if (!raw) return 0
    const parsed = Number.parseInt(raw, 10)
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed
  } catch {
    return 0
  }
}

/**
 * Tracks how many messages a guest has sent this browser tab and whether they
 * have hit the login gate.
 *
 * The counter lives in sessionStorage (per-tab) and only matters while
 * unauthenticated. It resets whenever `isAuthenticated` changes value
 * (login or logout edge): a real login starts the authenticated experience
 * fresh, and a logout hands the next guest a fresh allowance. A genuine guest
 * reload produces no edge, so the count is preserved; a logged-in reload's
 * `false -> true` hydration edge merely resets an unused counter.
 */
export const useGuestChatQuota = (isAuthenticated: boolean) => {
  const [count, setCount] = useState<number>(() => readStoredCount())

  const prevAuthRef = useRef(isAuthenticated)

  useEffect(() => {
    if (prevAuthRef.current === isAuthenticated) return
    prevAuthRef.current = isAuthenticated

    clearGuestQuotaStorage()
    setCount(0)
  }, [isAuthenticated])

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1
      try {
        sessionStorage.setItem(COUNT_KEY, String(next))
      } catch {
        // Silent fail
      }
      return next
    })
  }, [])

  const limitReached = !isAuthenticated && count >= GUEST_MESSAGE_LIMIT

  return { count, limitReached, increment }
}
