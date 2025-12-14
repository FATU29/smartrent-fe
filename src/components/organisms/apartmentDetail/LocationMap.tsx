import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { MapPin, Navigation, ExternalLink, Car, Train, Bus } from 'lucide-react'

interface LocationData {
  address: string
  city: string
  latitude?: number
  longitude?: number
  nearbyPlaces?: {
    type: 'transport' | 'shopping' | 'education' | 'healthcare'
    name: string
    distance: string
    walkTime: string
  }[]
}

interface LocationMapProps {
  location: LocationData
  className?: string
}

const LocationMap: React.FC<LocationMapProps> = ({ location, className }) => {
  const handleGetDirections = () => {
    // Future: Open Google Maps directions
  }

  const handleViewInMaps = () => {
    // Future: Open location in Google Maps
  }

  const mockNearbyPlaces = [
    {
      type: 'transport' as const,
      name: 'Bến Thành Metro Station',
      distance: '0.8km',
      walkTime: '10 min walk',
    },
    {
      type: 'shopping' as const,
      name: 'Saigon Centre',
      distance: '0.5km',
      walkTime: '6 min walk',
    },
    {
      type: 'education' as const,
      name: 'RMIT University',
      distance: '1.2km',
      walkTime: '15 min walk',
    },
    {
      type: 'healthcare' as const,
      name: 'FV Hospital',
      distance: '2.1km',
      walkTime: '25 min walk',
    },
  ]

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'transport':
        return <Train className='w-4 h-4 text-blue-500' />
      case 'shopping':
        return <Car className='w-4 h-4 text-green-500' />
      case 'education':
        return <Bus className='w-4 h-4 text-purple-500' />
      case 'healthcare':
        return <MapPin className='w-4 h-4 text-red-500' />
      default:
        return <MapPin className='w-4 h-4 text-gray-500' />
    }
  }

  return (
    <div className={className}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <Typography variant='h4' className='font-semibold text-xl'>
            Location & Map
          </Typography>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleGetDirections}
              className='text-sm'
            >
              <Navigation className='w-4 h-4 mr-2' />
              Directions
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleViewInMaps}
              className='text-sm'
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              View in Maps
            </Button>
          </div>
        </div>

        {/* Address */}
        <div className='flex items-start space-x-3'>
          <MapPin className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
          <div>
            <Typography variant='p' className='font-medium text-foreground'>
              {location.address}
            </Typography>
            <Typography variant='small' className='text-muted-foreground'>
              {location.city}
            </Typography>
          </div>
        </div>

        {/* Map Placeholder */}
        <Card className='overflow-hidden border-0 shadow-md'>
          <div className='relative aspect-[16/9] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900'>
            {/* Map Placeholder Content */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center space-y-4'>
                <div className='w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center'>
                  <MapPin className='w-8 h-8 text-primary' />
                </div>
                <div>
                  <Typography variant='h6' className='font-semibold mb-2'>
                    Interactive Map
                  </Typography>
                  <Typography
                    variant='small'
                    className='text-muted-foreground max-w-xs'
                  >
                    Google Maps integration coming soon. View the exact location
                    and surrounding area.
                  </Typography>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleViewInMaps}
                  className='bg-white/80 hover:bg-white'
                >
                  <ExternalLink className='w-4 h-4 mr-2' />
                  Open in Google Maps
                </Button>
              </div>
            </div>

            {/* Mock location pin */}
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
              <div className='w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse'></div>
            </div>

            {/* Mock surrounding points */}
            <div className='absolute top-1/3 left-1/4 w-2 h-2 bg-blue-500 rounded-full'></div>
            <div className='absolute top-2/3 right-1/3 w-2 h-2 bg-green-500 rounded-full'></div>
            <div className='absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-500 rounded-full'></div>
          </div>
        </Card>

        {/* Nearby Places */}
        <div className='space-y-4'>
          <Typography variant='h6' className='font-semibold'>
            Nearby Places
          </Typography>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {mockNearbyPlaces.map((place, index) => (
              <Card
                key={index}
                className='hover:shadow-md transition-shadow duration-200 border-0 shadow-sm'
              >
                <CardContent className='p-4'>
                  <div className='flex items-start space-x-3'>
                    <div className='mt-1'>{getPlaceIcon(place.type)}</div>
                    <div className='flex-1 min-w-0'>
                      <Typography
                        variant='p'
                        className='font-medium text-sm truncate'
                      >
                        {place.name}
                      </Typography>
                      <div className='flex items-center space-x-3 mt-1'>
                        <Typography
                          variant='small'
                          className='text-muted-foreground'
                        >
                          {place.distance}
                        </Typography>
                        <Typography
                          variant='small'
                          className='text-muted-foreground'
                        >
                          • {place.walkTime}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <Card className='bg-muted/30 border-0'>
          <CardContent className='p-4'>
            <div className='flex items-start space-x-3'>
              <MapPin className='w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0' />
              <div>
                <Typography
                  variant='small'
                  className='font-medium text-foreground mb-1'
                >
                  Convenient Location
                </Typography>
                <Typography
                  variant='small'
                  className='text-muted-foreground leading-relaxed'
                >
                  This property is located in a prime area with easy access to
                  public transportation, shopping centers, educational
                  institutions, and healthcare facilities. Perfect for urban
                  living with everything you need within walking distance.
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LocationMap
