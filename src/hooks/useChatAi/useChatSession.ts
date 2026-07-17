import { useState, useEffect, useCallback, useRef } from 'react'

import type { TChatMessage } from './useChatLogic'
import { clearGuestQuotaStorage } from './useGuestChatQuota'

const CHAT_SESSION_KEY = 'smart-rent-ai-chat-session'
// Records which identity the persisted messages belong to, so a login/logout/
// account-switch can wipe another identity's chat while a same-tab reload
// (which re-resolves to the same owner) keeps its restored history.
const CHAT_OWNER_KEY = 'smart-rent-ai-chat-owner'
// Sentinel owner for the unauthenticated (guest) state. Never collides with a
// real numeric userId.
const GUEST_OWNER = 'guest'

// Debounce window for sessionStorage writes. Streaming bot responses can fire
// 50-200 state updates per turn (one per text delta from the SSE stream). A
// synchronous JSON.stringify + sessionStorage.setItem on every delta blocks
// the main thread and causes visible streaming jank. 400ms is short enough
// that closing the tab still captures recent messages on the next pageshow,
// long enough to coalesce a full streaming response into one write.
const PERSIST_DEBOUNCE_MS = 400

type ChatSessionAuth = {
  isAuthenticated: boolean
  userId?: string | number | null
}

/** Clears both the persisted messages and the owner tag. Exposed so auth
 *  handlers can wipe the chat on login/logout even when the widget (and its
 *  in-memory reset effect) is not mounted on the current route. */
export const clearChatSessionStorage = () => {
  try {
    sessionStorage.removeItem(CHAT_SESSION_KEY)
    sessionStorage.removeItem(CHAT_OWNER_KEY)
  } catch {
    // Silent fail - session storage might be unavailable
  }
  // The guest message allowance is part of the same chat lifecycle: wipe it on
  // login/logout so the next identity starts with a fresh (or no) allowance.
  clearGuestQuotaStorage()
}

function readStoredOwner(): string | null {
  try {
    return sessionStorage.getItem(CHAT_OWNER_KEY)
  } catch {
    return null
  }
}

export const useChatSession = (
  initialMessage: TChatMessage,
  auth?: ChatSessionAuth,
) => {
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

  // Owner of the currently loaded messages. Seeded once from storage so a
  // reload knows who the restored history belongs to.
  const ownerRef = useRef<string | null | undefined>(undefined)
  if (ownerRef.current === undefined) {
    ownerRef.current = readStoredOwner()
  }

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

  // Reset the chat to its welcome state and re-stamp who now owns the session.
  const resetForOwner = useCallback(
    (owner: string) => {
      try {
        sessionStorage.removeItem(CHAT_SESSION_KEY)
        sessionStorage.setItem(CHAT_OWNER_KEY, owner)
      } catch {
        // Silent fail
      }
      ownerRef.current = owner
      setSessionMessages([initialMessage])
    },
    [initialMessage],
  )

  // Re-stamp ownership WITHOUT discarding the conversation. Used when an
  // unauthenticated visitor logs in: the guest chat belongs to the same
  // physical person, so it carries over into their authenticated session
  // instead of being wiped. The current messages are re-persisted under the
  // new owner so a subsequent reload restores them for that user.
  const adoptForOwner = useCallback((owner: string) => {
    try {
      sessionStorage.setItem(CHAT_OWNER_KEY, owner)
      sessionStorage.setItem(
        CHAT_SESSION_KEY,
        JSON.stringify(messagesRef.current),
      )
    } catch {
      // Silent fail
    }
    ownerRef.current = owner
  }, [])

  // React to identity changes (login / logout / account switch).
  //
  // A guest logging in is the SAME physical person continuing their session —
  // often they were just nudged to log in by the guest message gate — so their
  // in-progress conversation is adopted into the authenticated session, not
  // wiped. Every other identity change (switching between two real accounts, or
  // logging out) still wipes, to avoid one user seeing another's chat.
  //
  // The tricky part is a same-tab reload: the auth store boots as
  // unauthenticated and only re-resolves the logged-in user asynchronously
  // (false -> true edge). We must NOT treat that as a fresh login, or every
  // refresh would wipe the restored history. Two guards handle it:
  //   - When authenticated, compare the (reliable) userId against the stored
  //     owner: a reload resolves to the same owner (no-op); a login from guest
  //     adopts; a switch between real accounts resets.
  //   - When unauthenticated, only reset on an actual authenticated -> guest
  //     edge (explicit logout). The initial `false` may just be the hydration
  //     window of a logged-in user, so it must not wipe anything.
  const isAuthenticated = auth?.isAuthenticated ?? false
  const userId = auth?.userId
  const prevAuthRef = useRef(isAuthenticated)

  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current
    prevAuthRef.current = isAuthenticated

    if (isAuthenticated) {
      const identity =
        userId !== null && userId !== undefined ? String(userId) : GUEST_OWNER
      if (ownerRef.current !== identity) {
        // Owner was the guest sentinel (or never stamped) -> the messages are
        // the same person's guest conversation, safe to carry over. Owner was
        // another real account -> genuine switch, wipe.
        const cameFromGuest =
          ownerRef.current === null || ownerRef.current === GUEST_OWNER
        if (cameFromGuest) {
          adoptForOwner(identity)
        } else {
          resetForOwner(identity)
        }
      }
      return
    }

    // Unauthenticated: only a genuine logout edge counts as an identity change.
    if (wasAuthenticated && ownerRef.current !== GUEST_OWNER) {
      resetForOwner(GUEST_OWNER)
    }
  }, [isAuthenticated, userId, resetForOwner, adoptForOwner])

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

  const removeMessage = useCallback((id: string) => {
    setSessionMessages((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const setMessages = useCallback((messages: TChatMessage[]) => {
    setSessionMessages(messages)
  }, [])

  return {
    messages: sessionMessages,
    addMessage,
    updateMessage,
    removeMessage,
    setMessages,
    clearSession,
  }
}
