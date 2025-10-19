export const getErrorInfo = (
  code: number,
): { message: string; translationKey: string } => {
  switch (code) {
    case 1:
      return {
        message:
          'Location permission denied. Please enable location access in both browser settings and system settings, then restart your browser.',
        translationKey: 'permissionDenied',
      }
    case 2:
      return {
        message:
          'Location information unavailable. Please enable location services on your device.',
        translationKey: 'positionUnavailable',
      }
    case 3:
      return {
        message: 'Location request timed out. Please try again.',
        translationKey: 'timeout',
      }
    default:
      return {
        message: 'An unknown error occurred while getting location.',
        translationKey: 'unknownError',
      }
  }
}
