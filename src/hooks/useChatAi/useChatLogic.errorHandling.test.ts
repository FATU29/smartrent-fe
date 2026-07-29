import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { AiService } from '@/api/services/ai.service'
import { useChatLogic } from './useChatLogic'

// --- Dependency isolation (auth state, DOM-coupled scroll, network, i18n) ---
// Mirrors useChatLogic.guestQuota.test.ts so both suites stub the same seams.

const { authRef } = vi.hoisted(() => ({
  authRef: {
    current: {
      isAuthenticated: true,
      user: { userId: 'u1' } as { userId: string } | null,
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
  return { useTranslations: () => t, useLocale: () => 'en' }
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
  AiService: { chat: vi.fn() },
}))

const chatMock = AiService.chat as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  vi.clearAllMocks()
})

describe('useChatLogic error handling (blocking path)', () => {
  it('surfaces a retriable error message when the API call fails', async () => {
    // apiRequest never throws — on any network/timeout/HTTP error it resolves
    // with { success: false }. The hook must detect that and show an error.
    chatMock.mockResolvedValue({ success: false })

    const { result } = renderHook(() => useChatLogic())

    await act(async () => {
      await result.current.sendMessage('find me a room')
    })

    const errorMsg = result.current.messages.find(
      (m) => m.sender === 'bot' && m.error === true,
    )
    expect(errorMsg).toBeDefined()
    expect(errorMsg?.retryContent).toBe('find me a room')
    // Never leaves the UI stuck in a loading/typing state.
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isTyping).toBe(false)
  })

  it('does not treat a failed response carrying partial data as a real reply', async () => {
    // A failed envelope may still carry a data.message field; success:false
    // must win so it is not rendered as a normal answer.
    chatMock.mockResolvedValue({
      success: false,
      data: { message: { content: 'stale partial content' } },
    })

    const { result } = renderHook(() => useChatLogic())

    await act(async () => {
      await result.current.sendMessage('anything')
    })

    expect(
      result.current.messages.some(
        (m) => m.sender === 'bot' && m.content === 'stale partial content',
      ),
    ).toBe(false)
    expect(
      result.current.messages.some(
        (m) => m.sender === 'bot' && m.error === true,
      ),
    ).toBe(true)
  })

  it('retry re-sends the failed message and clears the error on success', async () => {
    chatMock.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({
      success: true,
      data: {
        message: { content: 'Here you go' },
        listings: null,
        metadata: { tools_used: [] },
      },
    })

    const { result } = renderHook(() => useChatLogic())

    await act(async () => {
      await result.current.sendMessage('find me a room')
    })

    const errorMsg = result.current.messages.find((m) => m.error === true)
    expect(errorMsg).toBeDefined()

    await act(async () => {
      await result.current.retryMessage(errorMsg!.id)
    })

    // Error bubble gone, success reply present.
    expect(result.current.messages.some((m) => m.error === true)).toBe(false)
    expect(
      result.current.messages.some(
        (m) => m.sender === 'bot' && m.content === 'Here you go',
      ),
    ).toBe(true)
    // Exactly one user bubble for the retried question — no duplicate.
    expect(
      result.current.messages.filter(
        (m) => m.sender === 'user' && m.content === 'find me a room',
      ),
    ).toHaveLength(1)
    expect(chatMock).toHaveBeenCalledTimes(2)
  })
})
