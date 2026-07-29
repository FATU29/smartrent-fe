import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const { authState, openAuthMock } = vi.hoisted(() => ({
  authState: { isAuthenticated: false },
  openAuthMock: vi.fn(),
}))

vi.mock('@/store/auth/index.store', () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: authState.isAuthenticated }),
}))

vi.mock('@/contexts/authDialog', () => ({
  useAuthDialog: () => ({ openAuth: openAuthMock }),
}))

import { useContactRevealGuard } from './useContactRevealGuard'

beforeEach(() => {
  authState.isAuthenticated = false
  openAuthMock.mockClear()
})

describe('useContactRevealGuard', () => {
  it('runs the action immediately when authenticated and keeps the dialog closed', () => {
    authState.isAuthenticated = true
    const action = vi.fn()
    const { result } = renderHook(() => useContactRevealGuard())

    act(() => {
      result.current.requireAuth(action)
    })

    expect(action).toHaveBeenCalledTimes(1)
    expect(result.current.dialogProps.open).toBe(false)
    expect(openAuthMock).not.toHaveBeenCalled()
  })

  it('blocks the action and opens the login dialog for a guest', () => {
    const action = vi.fn()
    const { result } = renderHook(() => useContactRevealGuard())

    act(() => {
      result.current.requireAuth(action)
    })

    expect(action).not.toHaveBeenCalled()
    expect(result.current.dialogProps.open).toBe(true)
    expect(openAuthMock).not.toHaveBeenCalled()
  })

  it('opens the auth flow with the current path and closes the dialog on confirm', () => {
    const { result } = renderHook(() => useContactRevealGuard())

    act(() => {
      result.current.requireAuth()
    })
    expect(result.current.dialogProps.open).toBe(true)

    act(() => {
      result.current.dialogProps.onConfirm()
    })

    // asPath comes from the global next/router mock in src/test/setup.ts
    expect(openAuthMock).toHaveBeenCalledWith('login', '/')
    expect(result.current.dialogProps.open).toBe(false)
  })
})
