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

const MAX_IMAGES = 24

const CoverUpload: React.FC = () => {
  const t = useTranslations('createPost.sections.media.cover')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const cover = propertyInfo.images.find((i) => i.isCover)

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const picked = Array.from(files)

    // Build new cover from first file
    const coverFile = picked[0]
    const coverItem = {
      id: `${Date.now()}-cover-${coverFile.name}`,
      url: URL.createObjectURL(coverFile),
      caption: coverFile.name.replace(/\.[^.]+$/, ''),
      isCover: true,
    }

    // Existing images turned to non-cover
    const existingNonCover = propertyInfo.images.map((i) => ({
      ...i,
      isCover: false,
    }))

    // How many more images can we add after placing the cover
    const remainingCapacity = Math.max(
      0,
      MAX_IMAGES - (existingNonCover.length + 1),
    )

    const extraFiles = picked.slice(1, 1 + remainingCapacity)
    const extraItems = extraFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      url: URL.createObjectURL(file),
      caption: file.name.replace(/\.[^.]+$/, ''),
      isCover: false,
    }))

    updatePropertyInfo({
      images: [coverItem, ...existingNonCover, ...extraItems].slice(
        0,
        MAX_IMAGES,
      ),
    })
  }

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg sm:text-xl'>
          <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mx-auto w-full max-w-xl'>
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
              <div className='p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2'>
                <p className='text-sm truncate text-muted-foreground'>
                  {cover.caption}
                </p>
                <Button
                  size='sm'
                  className='rounded-md'
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus className='w-4 h-4 mr-2' />
                  {t('replaceCta')}
                </Button>
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
        </div>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={(e) => onPick(e.target.files)}
        />
      </CardContent>
    </Card>
  )
}

export { CoverUpload }
