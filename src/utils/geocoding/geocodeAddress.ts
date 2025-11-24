import { ENV } from '@/constants/env'

export interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress?: string
}

/**
 * Geocode an address string to lat/lng using Google Geocoding API
 * @param address Full address string to geocode
 * @returns Promise with coordinates or null if failed
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  if (!address?.trim()) {
    return null
  }

  const apiKey = ENV.GOOGLE_MAP_KEY
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    console.warn('[Geocode] Missing or invalid Google Maps API key')
    return null
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('address', address)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('region', 'VN') // Bias results to Vietnam
    url.searchParams.set('language', 'vi') // Return Vietnamese results

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.results?.[0]) {
      const result = data.results[0]
      const location = result.geometry?.location

      if (location?.lat && location?.lng) {
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: result.formatted_address,
        }
      }
    }

    // Handle specific error cases
    if (data.status === 'REQUEST_DENIED') {
      console.error(
        '[Geocode] REQUEST_DENIED - Geocoding API not enabled or key restricted:',
        data.error_message,
      )
      console.error(
        '[Geocode] Please enable Geocoding API at: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com',
      )
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn('[Geocode] No results found for address:', address)
    } else if (data.status !== 'OK') {
      console.error('[Geocode] API error:', data.status, data.error_message)
    }

    return null
  } catch (error) {
    console.error('[Geocode] Failed to geocode address:', error)
    return null
  }
}
