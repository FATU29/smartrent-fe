import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import { MapPin, Search, FileText, Send, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PropertyInfoFormProps {
  className?: string
}

const PropertyInfoForm: React.FC<PropertyInfoFormProps> = ({ className }) => {
  const t = useTranslations('createPost.sections.propertyInfo')

  return (
    <div className={className}>
      {/* Property Information Card - Mobile First */}
      <Card className='mb-4 sm:mb-6'>
        <CardHeader className='pb-4 sm:pb-6'>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <FileText className='w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
            {t('listingInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 sm:space-y-6'>
          {/* Listing Type - Mobile First */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>{t('listingType')}</label>
            <Select defaultValue='rent'>
              <SelectTrigger className='h-10 sm:h-12'>
                <SelectValue placeholder='Chọn loại tin đăng' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='rent'>{t('listingTypes.rent')}</SelectItem>
                <SelectItem value='sale'>{t('listingTypes.sale')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Address - Mobile First */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              {t('propertyAddress')}
            </label>
            <div className='relative'>
              <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                className='w-full h-10 sm:h-12 pl-10 pr-4 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring text-sm sm:text-base'
                placeholder={t('addressPlaceholder')}
                defaultValue='123 Đường Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh'
              />
            </div>
            <p className='text-xs text-muted-foreground'>{t('addressHint')}</p>

            {/* Search Field - Mobile First */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                className='w-full h-10 sm:h-12 pl-10 pr-4 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring text-sm sm:text-base'
                placeholder={t('searchAddress')}
                defaultValue='123 Đường Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh'
              />
            </div>
          </div>

          {/* Map Preview - Mobile First */}
          <div className='space-y-3 sm:space-y-4'>
            {/* Stack on mobile and allow text wrapping */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0'>
              <h3 className='text-sm font-medium whitespace-normal break-words leading-snug'>
                {t('mapPreview')}
              </h3>
              <div className='flex gap-2 w-full sm:w-auto'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 sm:flex-none text-xs sm:text-sm'
                >
                  <Send className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                  <span className='hidden sm:inline'>{t('myLocation')}</span>
                  <span className='sm:hidden'>{t('myLocationShort')}</span>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 sm:flex-none text-xs sm:text-sm'
                >
                  <RotateCcw className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                  {t('reset')}
                </Button>
              </div>
            </div>

            {/* Map Placeholder - Mobile First */}
            <div className='w-full h-48 sm:h-64 bg-gradient-to-r from-green-100 to-red-100 dark:from-green-900/20 dark:to-red-900/20 rounded-lg border-2 border-dashed border-muted flex items-center justify-center relative'>
              <div className='text-center'>
                <MapPin className='w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2' />
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t('interactiveMap')}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {t('district')} 5, HCMC
                </p>
                <div className='absolute bottom-2 left-2 bg-background border border-border px-1 sm:px-2 py-1 rounded text-xs'>
                  <div className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full'></div>
                    <span className='hidden sm:inline'>
                      {t('selectedLocation')}
                    </span>
                    <span className='sm:hidden'>{t('selected')}</span>
                  </div>
                </div>
                <div className='absolute bottom-2 right-2 bg-background border border-border px-1 sm:px-2 py-1 rounded text-xs'>
                  {t('zoom')}: 15
                </div>
                <div className='absolute top-2 left-2 bg-background border border-border px-1 sm:px-2 py-1 rounded text-xs'>
                  {t('district')} 5, HCMC
                </div>
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full border-2 border-background'></div>
                </div>
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-2 text-xs bg-background border border-border px-1 rounded'>
                  {t('coordinates')}: 10.7769, 106.7009
                </div>
              </div>
            </div>

            <div className='text-xs text-muted-foreground space-y-1'>
              <p>{t('dragMarker')}</p>
              <p>{t('searchAddresses')}</p>
              <p className='flex items-center gap-1'>
                <MapPin className='w-3 h-3' />
                {t('interactiveMap')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { PropertyInfoForm }
export type { PropertyInfoFormProps }
