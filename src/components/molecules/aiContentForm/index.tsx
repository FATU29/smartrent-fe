import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AIContentFormProps {
  className?: string
}

const AIContentForm: React.FC<AIContentFormProps> = ({ className }) => {
  const t = useTranslations('createPost.sections.aiContent')
  const tGeneral = useTranslations('createPost')

  return (
    <div className={className}>
      {/* AI Generated Content Card - Mobile First */}
      <Card className='mb-4 sm:mb-6'>
        <CardContent className='space-y-4 sm:space-y-6'>
          {/* Listing Title - Mobile First */}
          <div className='space-y-2'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0'>
              <label className='text-sm font-medium'>{t('listingTitle')}</label>
              <Button
                variant='outline'
                size='sm'
                className='border-primary text-primary hover:bg-primary/10 w-full sm:w-auto text-xs sm:text-sm'
              >
                <Zap className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                {tGeneral('generateAutomatically')}
              </Button>
            </div>
            <input
              type='text'
              className='w-full h-10 sm:h-12 px-4 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring text-sm sm:text-base'
              placeholder='Nhập tiêu đề tin đăng'
              defaultValue='Căn Hộ Hiện Đại 2 Phòng Ngủ Tại Quận 1 - Trung Tâm Thành Phố'
            />
            <p className='text-xs text-muted-foreground'>{t('titleLength')}</p>
          </div>

          {/* Property Description - Mobile First */}
          <div className='space-y-2'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0'>
              <label className='text-sm font-medium'>
                {t('propertyDescription')}
              </label>
              <Button
                variant='outline'
                size='sm'
                className='border-primary text-primary hover:bg-primary/10 w-full sm:w-auto text-xs sm:text-sm'
              >
                <Zap className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                {tGeneral('generateAutomatically')}
              </Button>
            </div>
            <textarea
              className='w-full h-24 sm:h-32 px-4 py-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring resize-none text-sm sm:text-base'
              placeholder='Nhập mô tả bất động sản'
              defaultValue='Căn hộ hiện đại đẹp nằm ngay trung tâm Thành phố Hồ Chí Minh với tầm nhìn thành phố tuyệt đẹp và tiện nghi cao cấp.'
            />
            <p className='text-xs text-muted-foreground'>
              {t('descriptionHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button - Mobile First */}
      <div className='flex justify-center'>
        <Button className='w-full sm:max-w-md h-10 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm sm:text-base'>
          {tGeneral('continueToUpload')}
        </Button>
      </div>
    </div>
  )
}

export { AIContentForm }
export type { AIContentFormProps }
