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

const MAX_IMAGES = 24

const UploadImages: React.FC = () => {
  const t = useTranslations('createPost.sections.media')
  const { mediaUrls, pendingImages, addPendingImages, removePendingImage } =
    useCreatePost()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const uploadedImages = mediaUrls?.images || []
  const totalImages = uploadedImages.length + pendingImages.length

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = Math.max(0, MAX_IMAGES - totalImages)
    const slice = Array.from(files).slice(0, remaining)

    if (slice.length === 0) return

    const newPending = slice.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    addPendingImages(newPending)
  }

  const handleRemovePendingImage = (index: number) => {
    // Get non-cover pending images and find the actual index
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
            {uploadedImages.map((url, index) => (
              <div
                key={`uploaded-${index}`}
                className={`group relative rounded-xl border bg-white dark:bg-gray-900 overflow-hidden ${
                  index === 0
                    ? 'border-yellow-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className='relative aspect-[4/3] bg-gray-100 dark:bg-gray-800'>
                  {index === 0 && (
                    <span className='absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-xs bg-yellow-400 text-gray-900 font-medium shadow-sm'>
                      {t('uploaded.cover')}
                    </span>
                  )}
                  <Image
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                    className='object-cover'
                  />
                </div>
                <div className='p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'>
                  <p className='text-sm truncate mb-3'>
                    {index === 0 ? t('uploaded.cover') : `Image ${index + 1}`}
                  </p>
                  <p className='text-xs text-green-600 dark:text-green-400'>
                    {t('uploaded.success')}
                  </p>
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
                      {`Image ${uploadedImages.length + index + 1}`}
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
