import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useChatSession } from './useChatSession'
import type { TChatMessage } from './useChatLogic'

const CHAT_SESSION_KEY = 'smart-rent-ai-chat-session'
const CHAT_OWNER_KEY = 'smart-rent-ai-chat-owner'

const initialMessage: TChatMessage = {
  id: 'welcome-msg-initial',
  content: 'welcome',
  sender: 'bot',
  timestamp: new Date('2020-01-01T00:00:00Z'),
}

const userMsg = (id: string): TChatMessage => ({
  id,
  content: `msg-${id}`,
  sender: 'user',
  timestamp: new Date('2020-01-01T00:00:00Z'),
})

type Auth = { isAuthenticated: boolean; userId?: string | number | null }

const render = (initialAuth: Auth) =>
  renderHook(({ auth }) => useChatSession(initialMessage, auth), {
    initialProps: { auth: initialAuth },
  })

beforeEach(() => {
  sessionStorage.clear()
})

describe('useChatSession identity reset', () => {
  it('carries guest history over when a guest logs in (same person)', () => {
    const { result, rerender } = render({ isAuthenticated: false })

    act(() => {
      result.current.addMessage(userMsg('guest-1'))
    })
    expect(result.current.messages).toHaveLength(2)

    // Guest logs in -> the in-progress conversation belongs to the same
    // physical person and must carry over into their authenticated session.
    rerender({ auth: { isAuthenticated: true, userId: 'u1' } })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1].id).toBe('guest-1')
    // Ownership is re-stamped to the now-authenticated user, and the adopted
    // conversation is persisted under that owner so a reload keeps it.
    expect(sessionStorage.getItem(CHAT_OWNER_KEY)).toBe('u1')
    const stored = JSON.parse(
      sessionStorage.getItem(CHAT_SESSION_KEY) as string,
    ) as TChatMessage[]
    expect(stored).toHaveLength(2)
  })

  it('wipes an adopted guest chat when that user later switches accounts', () => {
    // Guest chats, then logs in as u1 (adopt), then a different real account
    // u2 takes over the tab -> genuine identity switch, must wipe.
    const { result, rerender } = render({ isAuthenticated: false })

    act(() => {
      result.current.addMessage(userMsg('guest-1'))
    })
    rerender({ auth: { isAuthenticated: true, userId: 'u1' } })
    expect(result.current.messages).toHaveLength(2)

    rerender({ auth: { isAuthenticated: true, userId: 'u2' } })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].id).toBe('welcome-msg-initial')
  })

  it('clears history on logout', () => {
    const { result, rerender } = render({
      isAuthenticated: true,
      userId: 'u1',
    })

    act(() => {
      result.current.addMessage(userMsg('u1-1'))
    })
    expect(result.current.messages).toHaveLength(2)

    rerender({ auth: { isAuthenticated: false } })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].id).toBe('welcome-msg-initial')
  })

  it('clears history when switching directly to another account', () => {
    const { result, rerender } = render({
      isAuthenticated: true,
      userId: 'u1',
    })

    act(() => {
      result.current.addMessage(userMsg('u1-1'))
    })
    expect(result.current.messages).toHaveLength(2)

    rerender({ auth: { isAuthenticated: true, userId: 'u2' } })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].id).toBe('welcome-msg-initial')
  })

  it('does NOT wipe restored history on reload of the same user (hydration)', () => {
    // Simulate a same-tab reload: sessionStorage still holds u1's messages,
    // tagged with u1 as owner. Auth starts unauthenticated (hydrating) then
    // resolves back to the same u1 via the async auth init.
    sessionStorage.setItem(
      CHAT_SESSION_KEY,
      JSON.stringify([initialMessage, userMsg('u1-1')]),
    )
    sessionStorage.setItem(CHAT_OWNER_KEY, 'u1')

    const { result, rerender } = render({ isAuthenticated: false })

    // Restored on mount before auth resolves
    expect(result.current.messages).toHaveLength(2)

    // Hydration completes -> re-authenticated as the SAME user
    rerender({ auth: { isAuthenticated: true, userId: 'u1' } })

    // History must be preserved, not reset to welcome
    expect(result.current.messages).toHaveLength(2)
  })
})
