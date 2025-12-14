import React, { useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { ImagePlus, Trash2 } from 'lucide-react'
import type { MediaItem } from '@/api/types/property.type'
import { useCreatePost } from '@/contexts/createPost'
import { toast } from 'sonner'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

interface CoverUploadProps {
  coverImage?: Partial<MediaItem>
}

const CoverUpload: React.FC<CoverUploadProps> = ({ coverImage }) => {
  const t = useTranslations('createPost.sections.media.cover')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { addPendingImages, removePendingImage, removeMedia, pendingImages } =
    useCreatePost()

  const validateImageFile = (file: File): boolean => {
    // Validate file size (10MB)
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        t('validation.imageSizeExceeded') ||
          `Cover image size must not exceed 10MB. File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      )
      return false
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        t('validation.imageFormatInvalid') ||
          'Cover image must be jpeg, png, or webp format',
      )
      return false
    }

    return true
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file before processing
    if (!validateImageFile(file)) {
      return
    }

    const coverIndex = pendingImages.findIndex((img) => img.isCover)
    if (coverIndex !== -1) {
      removePendingImage(coverIndex, true)
    }

    const newPending = [
      {
        file,
        previewUrl: URL.createObjectURL(file),
        isCover: true,
      },
    ]
    addPendingImages(newPending)

    toast.success(t('uploaded.success') || 'Cover image added successfully')
  }

  const handleDeleteCover = () => {
    const coverIndex = pendingImages.findIndex((img) => img.isCover)
    if (coverIndex !== -1) {
      // Remove pending cover
      removePendingImage(coverIndex, true)
    } else if (coverImage?.mediaId) {
      // Remove uploaded cover
      removeMedia(coverImage.mediaId)
    }
  }

  const pendingCover = pendingImages.find((img) => img.isCover)
  const displayImage = pendingCover?.previewUrl || coverImage?.url

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg sm:text-xl'>
          <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mx-auto w-full max-w-xl'>
          {displayImage ? (
            <div className='relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
              <div className='relative aspect-[4/3]'>
                <span className='absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-xs bg-yellow-400 text-gray-900 font-medium shadow-sm'>
                  {t('badge')}
                </span>
                <Image
                  src={displayImage}
                  alt='Cover image'
                  fill
                  className='object-cover'
                />
              </div>
              <div className='p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2'>
                <Button
                  size='sm'
                  className='rounded-md'
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus className='w-4 h-4 mr-2' />
                  {t('replaceCta')}
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  className='rounded-md'
                  onClick={handleDeleteCover}
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  {t('deleteCta')}
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
          className='hidden'
          onChange={(e) => handleFiles(e.target.files)}
        />
      </CardContent>
    </Card>
  )
}

export { CoverUpload }
