import { create } from 'zustand'

// Which auth event the centered success overlay is currently confirming, or
// null when the overlay is hidden. Login and logout are triggered from
// different places (login dialog vs. user dropdown / mobile drawer), so a tiny
// global store lets any of them raise the single app-level overlay.
export type AuthFeedbackVariant = 'login' | 'logout'

interface AuthFeedbackState {
  success: AuthFeedbackVariant | null
  show: (variant: AuthFeedbackVariant) => void
  clear: () => void
}

export const useAuthFeedback = create<AuthFeedbackState>()((set) => ({
  success: null,
  show: (variant) => set({ success: variant }),
  clear: () => set({ success: null }),
}))
