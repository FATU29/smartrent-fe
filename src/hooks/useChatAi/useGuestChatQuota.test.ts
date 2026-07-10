import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import {
  useGuestChatQuota,
  clearGuestQuotaStorage,
  GUEST_MESSAGE_LIMIT,
} from './useGuestChatQuota'

const COUNT_KEY = 'smart-rent-ai-guest-msg-count'

const renderQuota = (initialAuth: boolean) =>
  renderHook(({ auth }) => useGuestChatQuota(auth), {
    initialProps: { auth: initialAuth },
  })

beforeEach(() => {
  sessionStorage.clear()
})

describe('useGuestChatQuota', () => {
  it('lets a guest send up to the limit, then flips limitReached', () => {
    const { result } = renderQuota(false)

    expect(result.current.count).toBe(0)
    expect(result.current.limitReached).toBe(false)

    for (let i = 0; i < GUEST_MESSAGE_LIMIT - 1; i++) {
      act(() => result.current.increment())
    }
    expect(result.current.count).toBe(GUEST_MESSAGE_LIMIT - 1)
    expect(result.current.limitReached).toBe(false)

    act(() => result.current.increment())
    expect(result.current.count).toBe(GUEST_MESSAGE_LIMIT)
    expect(result.current.limitReached).toBe(true)
    expect(sessionStorage.getItem(COUNT_KEY)).toBe(String(GUEST_MESSAGE_LIMIT))
  })

  it('never limits an authenticated user, even past the count', () => {
    sessionStorage.setItem(COUNT_KEY, String(GUEST_MESSAGE_LIMIT))
    const { result } = renderQuota(true)

    expect(result.current.limitReached).toBe(false)
  })

  it('resets the counter when a guest logs in', () => {
    const { result, rerender } = renderQuota(false)

    for (let i = 0; i < GUEST_MESSAGE_LIMIT; i++) {
      act(() => result.current.increment())
    }
    expect(result.current.limitReached).toBe(true)

    rerender({ auth: true })

    expect(result.current.count).toBe(0)
    expect(result.current.limitReached).toBe(false)
  })

  it('resets the counter on logout so the next guest gets a fresh allowance', () => {
    sessionStorage.setItem(COUNT_KEY, '3')
    const { result, rerender } = renderQuota(false)

    expect(result.current.count).toBe(3) // preserved on mount (guest, no edge)

    rerender({ auth: true }) // login edge
    expect(result.current.count).toBe(0)

    rerender({ auth: false }) // logout edge
    expect(result.current.count).toBe(0)
  })

  it('preserves the count across a guest reload (no auth edge)', () => {
    sessionStorage.setItem(COUNT_KEY, '3')
    const { result } = renderQuota(false)

    expect(result.current.count).toBe(3)
    expect(result.current.limitReached).toBe(false)
  })

  it('clearGuestQuotaStorage removes the stored count', () => {
    sessionStorage.setItem(COUNT_KEY, '4')
    clearGuestQuotaStorage()
    expect(sessionStorage.getItem(COUNT_KEY)).toBeNull()
  })
})
