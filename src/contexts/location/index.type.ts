import type { ReactNode } from 'react'

export enum PermissionState {
  GRANTED = 'granted',
  DENIED = 'denied',
  PROMPT = 'prompt',
}

export interface LocationCoordinates {
  latitude: number
  longitude: number
}

export interface LocationError {
  code: number
  message: string
  translationKey?: string
}

export type LocationContextType = {
  coordinates: LocationCoordinates | null
  isLoading: boolean
  error: LocationError | null
  isEnabled: boolean
  isSupported: boolean
  toggleLocation: () => Promise<void>
  enableLocation: () => Promise<void>
  disableLocation: () => void
  requestLocation: () => Promise<boolean>
  clearError: () => void
}

export interface LocationProviderProps {
  children: ReactNode
}
