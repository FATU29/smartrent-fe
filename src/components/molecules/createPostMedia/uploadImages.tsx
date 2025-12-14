import React, { useRef } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import { ImagePlus, Upload, Trash2 } from 'lucide-react'
import type { MediaItem } from '@/api/types/property.type'
import { toast } from 'sonner'

const MAX_IMAGES = 24
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

interface UploadImagesProps {
  images?: Partial<MediaItem>[]
}

const UploadImages: React.FC<UploadImagesProps> = ({ images = [] }) => {
  const t = useTranslations('createPost.sections.media')
  const { pendingImages, addPendingImages, removePendingImage, removeMedia } =
    useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const totalImages = images.length + pendingImages.length

  const validateImageFile = (file: File): boolean => {
    // Validate file size (10MB)
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        t('validation.imageSizeExceeded') ||
          `Image size must not exceed 10MB. File: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      )
      return false
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        t('validation.imageFormatInvalid') ||
          `Image must be jpeg, png, or webp format. File: ${file.name}`,
      )
      return false
    }

    return true
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = Math.max(0, MAX_IMAGES - totalImages)

    // Validate all files first
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    Array.from(files).forEach((file) => {
      if (validateImageFile(file)) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    })

    if (invalidFiles.length > 0) {
      console.warn('Invalid files rejected:', invalidFiles)
    }

    const slice = validFiles.slice(0, remaining)

    if (slice.length === 0) {
      if (validFiles.length > remaining) {
        toast.error(
          t('validation.imagesLimitReached') ||
            `Maximum ${MAX_IMAGES} images allowed`,
        )
      }
      return
    }

    const newPending = slice.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    addPendingImages(newPending)
  }

  const handleRemovePendingImage = (index: number) => {
    const nonCoverPending = pendingImages.filter((img) => !img.isCover)
    const targetImage = nonCoverPending[index]
    if (!targetImage) return

    const actualIndex = pendingImages.findIndex((img) => img === targetImage)
    if (actualIndex !== -1) {
      removePendingImage(actualIndex)
    }
  }

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <span className='text-lg sm:text-xl'>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Dropzone */}
        <div
          className='rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 sm:p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900/50'
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(e.dataTransfer.files)
          }}
        >
          <Upload className='w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-2' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {t('dropzone.hint')}
          </p>
          <div className='flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto'>
            <Button
              className='rounded-lg w-full sm:w-auto'
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className='w-4 h-4 mr-2' />
              {t('dropzone.uploadFromDevice')}
            </Button>
          </div>
          <input
            ref={inputRef}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className='text-xs text-gray-500 dark:text-gray-500 mt-3'>
            {t('dropzone.note')}
          </p>
        </div>

        {/* Uploaded list */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {t('uploaded.title')}
            </span>
            <span className='text-xs text-gray-500'>
              {totalImages}/{MAX_IMAGES}
            </span>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5'>
            {/* Uploaded images from context */}
            {images.map((img, index) => (
              <div
                key={`uploaded-${index}`}
                className='group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden'
              >
                <div className='relative aspect-[4/3] bg-gray-100 dark:bg-gray-800'>
                  <Image
                    src={img.url || ''}
                    alt={`Image ${index + 1}`}
                    fill
                    sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                    className='object-cover'
                  />
                </div>
                <div className='p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'>
                  <p className='text-sm truncate mb-3'>{`Image ${index + 1}`}</p>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-xs text-green-600 dark:text-green-400'>
                      {t('uploaded.success')}
                    </p>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950'
                      onClick={() => img.mediaId && removeMedia(img.mediaId)}
                      title={t('uploaded.remove')}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {/* Pending images (not uploaded yet) */}
            {pendingImages
              .filter((img) => !img.isCover)
              .map((img, index) => (
                <div
                  key={`pending-${index}`}
                  className='group relative rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 overflow-hidden'
                >
                  <div className='relative aspect-[4/3] bg-gray-100 dark:bg-gray-800'>
                    <Image
                      src={img.previewUrl}
                      alt={`Pending ${index + 1}`}
                      fill
                      sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                      className='object-cover'
                    />
                  </div>
                  <div className='p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'>
                    <p className='text-sm truncate mb-3'>
                      {`Image ${images.length + index + 1}`}
                    </p>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='h-8 px-2 rounded-md w-full text-sm'
                      onClick={() => handleRemovePendingImage(index)}
                    >
                      <Trash2 className='w-4 h-4 mr-1' />
                      {t('uploaded.remove')}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { UploadImages }
