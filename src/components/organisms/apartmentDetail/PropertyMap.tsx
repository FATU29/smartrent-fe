import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { ExternalLink } from 'lucide-react'

interface PropertyMapProps {
  location?: {
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  address?: React.ReactNode
}

const PropertyMap: React.FC<PropertyMapProps> = ({ location, address }) => {
  const t = useTranslations('apartmentDetail')

  if (!location?.coordinates) {
    return null
  }

  const { latitude, longitude } = location.coordinates

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s`

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3' className='text-xl font-bold'>
          {t('sections.location')}
        </Typography>
        <Button
          variant='outline'
          size='sm'
          onClick={() => window.open(googleMapsUrl, '_blank')}
          className='flex items-center gap-2'
        >
          <ExternalLink className='w-4 h-4' />
          {t('map.openInGoogleMaps')}
        </Button>
      </div>

      {address && <div className='space-y-2'>{address}</div>}

      {/* Map Embed */}
      <Card>
        <CardContent className='relative w-full aspect-[16/9] p-0 overflow-hidden rounded-lg'>
          <iframe
            src={embedUrl}
            width='100%'
            height='100%'
            style={{ border: 0 }}
            allowFullScreen
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            title='Property Location Map'
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default PropertyMap
