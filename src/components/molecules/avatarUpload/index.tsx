import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'
import { Camera, Upload } from 'lucide-react'
import { cn, getUserInitials } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentImage?: string
  firstName?: string
  lastName?: string
  onImageChange?: (file: File | null) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  maxSizeInMB?: number // Default: 10MB
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentImage,
  firstName = '',
  lastName = '',
  onImageChange,
  className,
  size = 'lg',
  maxSizeInMB = 10,
}) => {
  const t = useTranslations()
  const [preview, setPreview] = React.useState<string | null>(
    currentImage || null,
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync preview with currentImage prop changes (e.g., after successful upload)
  React.useEffect(() => {
    if (currentImage && currentImage !== preview) {
      setPreview(currentImage)
    }
  }, [currentImage])

  const sizeClasses = {
    sm: 'size-16',
    md: 'size-24',
    lg: 'size-32',
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      toast.error(
        t('homePage.auth.validation.avatarSizeExceeded', {
          maxSize: maxSizeInMB,
        }) || `Avatar file size must not exceed ${maxSizeInMB}MB`,
      )
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        t('homePage.auth.validation.avatarFormatInvalid') ||
          'Avatar must be jpeg, png, or webp format',
      )
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Notify parent component
    onImageChange?.(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const initials = getUserInitials(firstName, lastName)
  const fullName = `${firstName} ${lastName}`.trim()

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className='relative group'>
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage src={preview || currentImage} alt={fullName} />
          {initials && (
            <AvatarFallback className='bg-primary text-primary-foreground text-lg font-semibold'>
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Overlay button on hover */}
        <div className='absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='text-white hover:text-white hover:bg-white/20'
            onClick={handleUploadClick}
          >
            <Camera className='h-6 w-6' />
          </Button>
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={handleUploadClick}
        className='gap-2'
      >
        <Upload className='h-4 w-4' />
        {t('homePage.auth.accountManagement.personalInfo.avatarUpload')}
      </Button>

      <p className='text-xs text-muted-foreground text-center'>
        {t('homePage.auth.accountManagement.personalInfo.avatarRequirements', {
          maxSize: maxSizeInMB,
        }) || `Max ${maxSizeInMB}MB • JPEG, PNG, WebP`}
      </p>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/jpg,image/png,image/webp'
        onChange={handleFileChange}
        className='hidden'
      />
    </div>
  )
}

export { AvatarUpload }
