import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { AiService } from '@/api/services/ai.service'
import { useChatLogic } from './useChatLogic'

const COUNT_KEY = 'smart-rent-ai-guest-msg-count'

// --- Dependency isolation (auth state, DOM-coupled scroll, network, i18n) ---

const { authRef } = vi.hoisted(() => ({
  authRef: {
    current: {
      isAuthenticated: false,
      user: null as { userId: string } | null,
    },
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authRef.current,
}))

vi.mock('next-intl', () => {
  const t = ((key: string) => key) as ((key: string) => string) & {
    raw: (key: string) => unknown
  }
  t.raw = () => []
  return { useTranslations: () => t, useLocale: () => 'vi' }
})

vi.mock('./useChatScroll', () => ({
  useChatScroll: () => ({
    scrollRef: { current: null },
    bottomRef: { current: null },
    contentRef: { current: null },
    isAtBottom: true,
    reservedSpace: 0,
    scrollToMessage: vi.fn(),
    scrollToBottom: vi.fn(),
    anchorMessageToTop: vi.fn(),
    finalizeReservedSpace: vi.fn(),
  }),
}))

vi.mock('@/api/services/chatbot.service', () => ({
  streamChat: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/api/services/ai.service', () => ({
  AiService: {
    chat: vi.fn().mockResolvedValue({
      data: {
        message: { content: 'ok' },
        listings: null,
        metadata: { tools_used: [] },
      },
    }),
  },
}))

const setAuth = (isAuthenticated: boolean, userId?: string) => {
  authRef.current = {
    isAuthenticated,
    user: userId ? { userId } : null,
  }
}

beforeEach(() => {
  sessionStorage.clear()
  vi.clearAllMocks()
  setAuth(false)
})

describe('useChatLogic guest quota gating', () => {
  it('blocks a guest at the limit: shows login CTA, exposes flag, does not dispatch', async () => {
    setAuth(false)
    sessionStorage.setItem(COUNT_KEY, '5')

    const { result } = renderHook(() => useChatLogic())

    expect(result.current.guestLimitReached).toBe(true)
    expect(
      result.current.messages.some((m) => m.id === 'guest-limit-cta'),
    ).toBe(true)

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    expect(AiService.chat).not.toHaveBeenCalled()
    expect(result.current.messages.some((m) => m.sender === 'user')).toBe(false)
  })

  it('lets a guest under the limit send, and consumes one turn', async () => {
    setAuth(false)

    const { result } = renderHook(() => useChatLogic())

    expect(result.current.guestLimitReached).toBe(false)

    await act(async () => {
      await result.current.sendMessage('tìm phòng trọ')
    })

    expect(AiService.chat).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(COUNT_KEY)).toBe('1')
    expect(
      result.current.messages.some(
        (m) => m.sender === 'user' && m.content === 'tìm phòng trọ',
      ),
    ).toBe(true)
  })

  it('never gates an authenticated user, even past the guest count', async () => {
    setAuth(true, 'u1')
    sessionStorage.setItem(COUNT_KEY, '5')

    const { result } = renderHook(() => useChatLogic())

    expect(result.current.guestLimitReached).toBe(false)

    await act(async () => {
      await result.current.sendMessage('hi')
    })

    expect(AiService.chat).toHaveBeenCalledTimes(1)
  })
})
