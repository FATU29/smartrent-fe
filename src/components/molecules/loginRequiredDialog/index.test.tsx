import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginRequiredDialog from './index'

// next-intl is globally mocked in src/test/setup.ts to echo the key back, so
// assertions below match on the translation keys.
describe('LoginRequiredDialog', () => {
  it('renders the shared login-required copy when open', () => {
    render(
      <LoginRequiredDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />,
    )

    expect(screen.getByText('loginRequiredTitle')).toBeInTheDocument()
    expect(screen.getByText('loginRequiredDescription')).toBeInTheDocument()
    expect(screen.getByText('loginNow')).toBeInTheDocument()
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  it('calls onConfirm when the login button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <LoginRequiredDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} />,
    )

    fireEvent.click(screen.getByText('loginNow'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('closes via onOpenChange when cancel is clicked', () => {
    const onOpenChange = vi.fn()
    render(
      <LoginRequiredDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText('cancel'))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('prefers explicit title/description overrides when provided', () => {
    render(
      <LoginRequiredDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title='Custom title'
        description='Custom description'
      />,
    )

    expect(screen.getByText('Custom title')).toBeInTheDocument()
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })
})
