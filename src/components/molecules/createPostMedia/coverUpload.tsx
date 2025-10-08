import React, { useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { ImagePlus } from 'lucide-react'

const CoverUpload: React.FC = () => {
  const t = useTranslations('createPost.sections.media.cover')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const cover = propertyInfo.images.find((i) => i.isCover)

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const url = URL.createObjectURL(file)
    const newItem = {
      id: `${Date.now()}-${file.name}`,
      url,
      caption: file.name.replace(/\.[^.]+$/, ''),
      isCover: true,
    }
    // Mark all existing as not cover and append the new cover image
    updatePropertyInfo({
      images: [
        ...propertyInfo.images.map((i) => ({ ...i, isCover: false })),
        newItem,
      ],
    })
  }

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-lg sm:text-xl'>
          <span>{t('title')}</span>
          <Button
            size='sm'
            className='rounded-lg'
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className='w-4 h-4 mr-2' />
            {cover ? t('replaceCta') : t('uploadCta')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cover ? (
          <div className='relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
            <div className='relative aspect-[4/3]'>
              <span className='absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-xs bg-yellow-400 text-gray-900 font-medium shadow-sm'>
                {t('badge')}
              </span>
              <Image
                src={cover.url}
                alt={cover.caption}
                fill
                className='object-cover'
              />
            </div>
            <div className='p-3 border-t border-gray-100 dark:border-gray-800'>
              <p className='text-sm truncate text-muted-foreground'>
                {cover.caption}
              </p>
            </div>
          </div>
        ) : (
          <div className='rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900/50'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {t('description')}
            </p>
            <Button
              className='mt-4 rounded-lg'
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className='w-4 h-4 mr-2' />
              {t('uploadCta')}
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => onPick(e.target.files)}
        />
      </CardContent>
    </Card>
  )
}

export { CoverUpload }
