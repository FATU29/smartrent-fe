import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react'

import type { LocationContextType, LocationProviderProps } from './index.type'
import { getErrorInfo } from './index.helper'

export { PermissionState } from './index.type'
export type { LocationCoordinates, LocationError } from './index.type'

import {
  PermissionState,
  LocationCoordinates,
  LocationError,
} from './index.type'

const GEOLOCATION_TIMEOUT = 30000 // Increase to 30s for better GPS lock
const GEOLOCATION_MAX_AGE = 5000 // Allow 5s cache for faster response
const PERMISSION_DENIED_CODE = 1

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
)

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<LocationError | null>(null)
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const requestInProgressRef = useRef(false)

  const isSupported = useMemo(() => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
  }, [])

  const checkPermissionStatus =
    useCallback(async (): Promise<PermissionState> => {
      if (typeof navigator === 'undefined' || !navigator.permissions) {
        return PermissionState.PROMPT
      }

      try {
        // Check geolocation permission status to determine if we should
        // automatically enable location on page load (if previously granted)
        // or show the toggle in disabled state (if denied/not yet requested).
        // This is necessary to provide a seamless user experience by remembering
        // the user's previous location permission choice. No location data is
        // accessed at this stage - we only check the permission state.
        // Geolocation is necessary for location-based property search with explicit user consent
        // NOSONAR: S6328 - Permission query necessary for UX, no location data accessed
        const result = await navigator.permissions.query({
          name: 'geolocation', // NOSONAR
        })
        return result.state as PermissionState
      } catch {
        return PermissionState.PROMPT
      }
    }, [])

  const handleGeolocationSuccess = useCallback(
    (pos: GeolocationPosition, resolve: (value: boolean) => void): void => {
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }

      setIsEnabled(true)
      setCoordinates(coords)
      setError(null)
      setIsLoading(false)
      requestInProgressRef.current = false
      resolve(true)
    },
    [],
  )

  const handleGeolocationError = useCallback(
    (
      err: GeolocationPositionError,
      highAccuracy: boolean,
      resolve: (value: boolean) => void,
      retry: () => void,
    ): void => {
      if (err.code === PERMISSION_DENIED_CODE) {
        setError(getErrorInfo(err.code) as LocationError)
        setIsEnabled(false)
        setIsLoading(false)
        requestInProgressRef.current = false
        resolve(false)
        return
      }

      if (highAccuracy) {
        retry()
        return
      }

      setError(getErrorInfo(err.code) as LocationError)
      setIsLoading(false)
      requestInProgressRef.current = false
      resolve(false)
    },
    [getErrorInfo],
  )

  const createGeolocationOptions = useCallback(
    (highAccuracy: boolean) => ({
      enableHighAccuracy: highAccuracy,
      timeout: GEOLOCATION_TIMEOUT,
      maximumAge: GEOLOCATION_MAX_AGE,
    }),
    [],
  )

  const executeGeolocationRequest = useCallback(
    (
      onSuccess: PositionCallback,
      onError: PositionErrorCallback,
      highAccuracy: boolean,
    ) => {
      // User geolocation is necessary to provide location-based property search
      // and nearby listings. The user must explicitly enable this feature via
      // the location toggle switch. Location data is used only for filtering
      // properties and is not stored or transmitted to third parties.
      // NOSONAR: S6328 - Core feature requires geolocation with explicit user opt-in
      navigator.geolocation.getCurrentPosition(
        // NOSONAR
        onSuccess,
        onError,
        createGeolocationOptions(highAccuracy),
      )
    },
    [createGeolocationOptions],
  )

  const createGeolocationAttempt = useCallback(
    (resolve: (value: boolean) => void): ((highAccuracy: boolean) => void) => {
      const attemptGeolocation = (highAccuracy: boolean) => {
        const onSuccess = (pos: GeolocationPosition) =>
          handleGeolocationSuccess(pos, resolve)

        const onError = (err: GeolocationPositionError) => {
          const retry = () => attemptGeolocation(false)
          handleGeolocationError(err, highAccuracy, resolve, retry)
        }

        executeGeolocationRequest(onSuccess, onError, highAccuracy)
      }
      return attemptGeolocation
    },
    [
      handleGeolocationSuccess,
      handleGeolocationError,
      executeGeolocationRequest,
    ],
  )

  const requestLocationPermissionAndGetPosition =
    useCallback(async (): Promise<boolean> => {
      if (requestInProgressRef.current) return false
      if (!isSupported) {
        setError({
          code: 0,
          message: 'Geolocation is not supported by your browser.',
          translationKey: 'notSupported',
        })
        return false
      }

      setError(null)
      setIsLoading(true)
      requestInProgressRef.current = true

      return new Promise<boolean>((resolve) => {
        const attemptGeolocation = createGeolocationAttempt(resolve)
        attemptGeolocation(true)
      })
    }, [isSupported, createGeolocationAttempt])

  const requestLocation = useCallback(
    () => requestLocationPermissionAndGetPosition(),
    [requestLocationPermissionAndGetPosition],
  )

  const enableLocation = useCallback(async () => {
    await requestLocationPermissionAndGetPosition()
  }, [requestLocationPermissionAndGetPosition])

  const disableLocation = useCallback(() => {
    setIsEnabled(false)
    setCoordinates(null)
    setError(null)
  }, [])

  const toggleLocation = useCallback(async () => {
    if (error || !isEnabled) {
      setError(null)
      await enableLocation()
    } else {
      disableLocation()
    }
  }, [isEnabled, enableLocation, disableLocation, error])

  const clearError = useCallback(() => setError(null), [])

  useEffect(() => {
    const initializeLocation = async () => {
      if (!isSupported) return

      const permissionStatus = await checkPermissionStatus()

      if (permissionStatus === PermissionState.GRANTED) {
        await requestLocation()
      } else {
        setIsEnabled(false)
      }
    }

    initializeLocation()
  }, [isSupported, checkPermissionStatus, requestLocation])

  const contextValue: LocationContextType = useMemo(
    () => ({
      coordinates,
      isLoading,
      error,
      isEnabled,
      isSupported,
      toggleLocation,
      enableLocation,
      disableLocation,
      requestLocation,
      clearError,
    }),
    [
      coordinates,
      isLoading,
      error,
      isEnabled,
      isSupported,
      toggleLocation,
      enableLocation,
      disableLocation,
      requestLocation,
      clearError,
    ],
  )

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocationContext = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}

export default LocationProvider
