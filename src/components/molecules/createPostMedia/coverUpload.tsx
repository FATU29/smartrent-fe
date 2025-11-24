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
import { ImagePlus, Trash2 } from 'lucide-react'

const MAX_IMAGES = 24

// Local state type for pending files
interface PendingImage {
  file: File
  previewUrl: string
  isCover: boolean
}

const CoverUpload: React.FC = () => {
  const t = useTranslations('createPost.sections.media.cover')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()

  // Local state for pending images (not uploaded yet)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Get cover from either uploaded (context) or pending (local)
  const uploadedImages = propertyInfo?.assets?.images || []
  const coverUrl = uploadedImages[0]
  const pendingCover = pendingImages.find((img) => img.isCover)

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const picked = Array.from(files)
    const remainingCapacity = Math.max(
      0,
      MAX_IMAGES - uploadedImages.length - pendingImages.length,
    )
    const slice = picked.slice(0, remainingCapacity)

    if (slice.length === 0) return

    // Remove old pending cover if exists
    const existingNonCover = pendingImages.filter((img) => !img.isCover)

    // Create new pending images
    const newPending: PendingImage[] = slice.map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: index === 0, // First file is cover
    }))

    setPendingImages([...newPending, ...existingNonCover].slice(0, MAX_IMAGES))
  }

  // Expose pending images for parent to upload
  React.useEffect(() => {
    // Store in window for MediaStep to access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__coverPendingImages = pendingImages
  }, [pendingImages])

  // Handle delete cover
  const handleDeleteCover = () => {
    // If there's a pending cover, remove it
    if (pendingCover) {
      URL.revokeObjectURL(pendingCover.previewUrl)
      setPendingImages(pendingImages.filter((img) => !img.isCover))
      return
    }

    // If there's an uploaded cover, remove the first image from assets
    if (coverUrl && uploadedImages.length > 0) {
      const newImages = uploadedImages.slice(1) // Remove first image
      updatePropertyInfo({
        assets: {
          ...propertyInfo?.assets,
          images: newImages,
        },
      })
    }
  }

  // Display cover: prefer uploaded, fallback to pending
  const displayCover = coverUrl || pendingCover?.previewUrl

  return (
    <Card className='mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg sm:text-xl'>
          <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mx-auto w-full max-w-xl'>
          {displayCover ? (
            <div className='relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
              <div className='relative aspect-[4/3]'>
                <span className='absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-xs bg-yellow-400 text-gray-900 font-medium shadow-sm'>
                  {t('badge')}
                </span>
                <Image
                  src={displayCover}
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
          multiple
          className='hidden'
          onChange={(e) => onPick(e.target.files)}
        />
      </CardContent>
    </Card>
  )
}

export { CoverUpload }
export type { PendingImage }
