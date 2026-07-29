import { useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/auth/index.store'
import { useAuthDialog } from '@/contexts/authDialog'

interface ContactRevealGuardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

interface UseContactRevealGuardResult {
  isAuthenticated: boolean
  /**
   * Run `action` only when the visitor is authenticated. Otherwise open the
   * login-required dialog and skip the action entirely — the real contact
   * value is never revealed to a guest.
   */
  requireAuth: (action?: () => void) => void
  /** Spread onto {@link LoginRequiredDialog}. */
  dialogProps: ContactRevealGuardDialogProps
}

/**
 * Gate for any action that reveals a user's real contact details (show phone,
 * open Zalo/mailto, copy). Reads auth straight from the store (not the
 * `useAuth` barrel) to avoid a circular import through `hooks/useAuth/index`.
 */
export const useContactRevealGuard = (): UseContactRevealGuardResult => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { openAuth } = useAuthDialog()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (isAuthenticated) {
        action?.()
        return
      }
      setOpen(true)
    },
    [isAuthenticated],
  )

  const onConfirm = useCallback(() => {
    setOpen(false)
    openAuth('login', router.asPath)
  }, [openAuth, router.asPath])

  return {
    isAuthenticated,
    requireAuth,
    dialogProps: { open, onOpenChange: setOpen, onConfirm },
  }
}
