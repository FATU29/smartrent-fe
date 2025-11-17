import React, { useRef, useState } from 'react'
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
import { ImagePlus, Loader2 } from 'lucide-react'
import { MediaService } from '@/api/services'
import { toast } from 'sonner'

const MAX_IMAGES = 24

const CoverUpload: React.FC = () => {
  const t = useTranslations('createPost.sections.media.cover')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const cover = propertyInfo?.images?.find((i) => i.isCover)

  const onPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const picked = Array.from(files)

    const coverFile = picked[0]

    // Upload cover first
    setIsUploading(true)
    try {
      const res = await MediaService.upload({
        file: coverFile,
        mediaType: 'IMAGE',
      })
      if (!res?.success || !res?.data?.url) throw new Error('upload failed')

      const coverItem = {
        id: String(res.data.mediaId ?? `${Date.now()}-cover-${coverFile.name}`),
        url: res.data.url,
        caption: coverFile.name.replace(/\.[^.]+$/, ''),
        isCover: true,
      }

      // Existing images turned to non-cover
      const existingNonCover =
        propertyInfo?.images?.map((i) => ({
          ...i,
          isCover: false,
        })) || []

      let workingList = [coverItem, ...existingNonCover]
      updatePropertyInfo({ images: workingList.slice(0, MAX_IMAGES) })

      // Upload extra files sequentially and append
      const remainingCapacity = Math.max(0, MAX_IMAGES - workingList.length)
      const extraFiles = picked.slice(1, 1 + remainingCapacity)
      for (const file of extraFiles) {
        try {
          const r = await MediaService.upload({ file, mediaType: 'IMAGE' })
          if (r?.success && r?.data?.url) {
            const item = {
              id: String(r.data.mediaId ?? `${Date.now()}-${file.name}`),
              url: r.data.url,
              caption: file.name.replace(/\.[^.]+$/, ''),
              isCover: false,
            }
            workingList = [...workingList, item]
            updatePropertyInfo({ images: workingList.slice(0, MAX_IMAGES) })
          }
        } catch {
          // ignore single failure, optionally toast
        }
      }
    } catch {
      toast.error('Không thể tải ảnh bìa')
    } finally {
      setIsUploading(false)
    }
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
                {isUploading && (
                  <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
                    <Loader2 className='w-8 h-8 text-white animate-spin' />
                  </div>
                )}
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
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  ) : (
                    <ImagePlus className='w-4 h-4 mr-2' />
                  )}
                  {t('replaceCta')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900/50'>
              {isUploading ? (
                <div className='flex flex-col items-center gap-3'>
                  <Loader2 className='w-8 h-8 text-blue-500 animate-spin' />
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {t('uploading')}
                  </p>
                </div>
              ) : (
                <>
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
                </>
              )}
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
