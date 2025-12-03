declare module 'google-map-react' {
  import * as React from 'react'
  interface BootstrapURLKeys {
    key: string
  }
  interface GoogleMapReactProps {
    bootstrapURLKeys?: BootstrapURLKeys
    defaultCenter?: { lat: number; lng: number }
    center?: { lat: number; lng: number }
    defaultZoom?: number
    zoom?: number
    yesIWantToUseGoogleMapApiInternals?: boolean
    onClick?: (e: { lat: number; lng: number; event: MouseEvent }) => void
    options?:
      | google.maps.MapOptions
      | ((maps: unknown) => google.maps.MapOptions)
    children?: React.ReactNode
  }
  export default class GoogleMapReact extends React.Component<GoogleMapReactProps> {}
}
