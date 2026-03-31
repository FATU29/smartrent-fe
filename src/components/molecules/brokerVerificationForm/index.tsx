import * as React from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import {
  AlertCircle,
  FileCheck2,
  IdCard,
  ImagePlus,
  Upload,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type BrokerVerificationFormProps = {
  isPersonalInfoComplete: boolean
  onRequirePersonalInfo: () => void
  className?: string
}

type UploadFieldProps = {
  label: string
  helperText: string
  file: File | null
  preview: string | null
  onFileChange: (file: File | null, preview: string | null) => void
  disabled?: boolean
  invalid?: boolean
  errorText?: string
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]
const MAX_FILE_SIZE_MB = 10

const validateImageFile = (
  file: File,
  t: ReturnType<typeof useTranslations>,
) => {
  const maxSizeInBytes = MAX_FILE_SIZE_MB * 1024 * 1024

  if (file.size > maxSizeInBytes) {
    toast.error(
      t('homePage.auth.accountManagement.brokerVerification.errors.fileSize', {
        maxSize: MAX_FILE_SIZE_MB,
      }),
    )
    return false
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error(
      t('homePage.auth.accountManagement.brokerVerification.errors.fileFormat'),
    )
    return false
  }

  return true
}

const UploadField: React.FC<UploadFieldProps> = ({
  label,
  helperText,
  file,
  preview,
  onFileChange,
  disabled = false,
  invalid = false,
  errorText,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handlePick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    const reader = new FileReader()
    reader.onloadend = () => {
      onFileChange(selected, reader.result as string)
    }
    reader.readAsDataURL(selected)
  }

  const handleRemove = () => {
    onFileChange(null, null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium'>{label}</label>
      <div
        className={cn(
          'rounded-lg border border-dashed p-4 transition-colors',
          invalid && 'border-destructive',
          disabled
            ? 'bg-muted/40 cursor-not-allowed'
            : 'hover:border-primary/60',
        )}
      >
        {preview ? (
          <div className='space-y-3'>
            <img
              src={preview}
              alt={label}
              className='h-40 w-full rounded-md object-cover border'
            />
            <div className='flex items-center justify-between gap-3'>
              <p className='text-xs text-muted-foreground truncate'>
                {file?.name}
              </p>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleRemove}
                disabled={disabled}
                className='text-muted-foreground'
              >
                <X className='size-4' />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type='button'
            onClick={handlePick}
            disabled={disabled}
            className='w-full flex flex-col items-center justify-center gap-2 py-6'
          >
            <ImagePlus className='size-5 text-muted-foreground' />
            <span className='text-sm font-medium'>{helperText}</span>
          </button>
        )}

        <input
          ref={inputRef}
          type='file'
          accept='image/jpeg,image/jpg,image/png,image/webp'
          onChange={handleFileSelect}
          disabled={disabled}
          className='hidden'
        />
      </div>
      {invalid && errorText && (
        <p className='text-xs text-destructive'>{errorText}</p>
      )}
    </div>
  )
}

const BrokerVerificationForm: React.FC<BrokerVerificationFormProps> = ({
  isPersonalInfoComplete,
  onRequirePersonalInfo,
  className,
}) => {
  const t = useTranslations()
  const [certificateFile, setCertificateFile] = React.useState<File | null>(
    null,
  )
  const [certificatePreview, setCertificatePreview] = React.useState<
    string | null
  >(null)
  const [idFrontFile, setIdFrontFile] = React.useState<File | null>(null)
  const [idFrontPreview, setIdFrontPreview] = React.useState<string | null>(
    null,
  )
  const [idBackFile, setIdBackFile] = React.useState<File | null>(null)
  const [idBackPreview, setIdBackPreview] = React.useState<string | null>(null)
  const [certificateError, setCertificateError] = React.useState(false)
  const [idFrontError, setIdFrontError] = React.useState(false)
  const [idBackError, setIdBackError] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const section1Ref = React.useRef<HTMLElement>(null)
  const section2Ref = React.useRef<HTMLElement>(null)

  const handleRequirePersonalInfo = React.useCallback(() => {
    toast.warning(
      t(
        'homePage.auth.accountManagement.brokerVerification.personalInfoIncompleteToast',
      ),
    )
    onRequirePersonalInfo()
  }, [onRequirePersonalInfo, t])

  const protectedSectionEnabled = isPersonalInfoComplete

  const handleChangeImage = React.useCallback(
    (
      file: File | null,
      preview: string | null,
      setter: (nextFile: File | null) => void,
      previewSetter: (nextPreview: string | null) => void,
      enforcePersonalInfo = false,
    ) => {
      if (enforcePersonalInfo && !protectedSectionEnabled) {
        handleRequirePersonalInfo()
        return
      }

      if (file && !validateImageFile(file, t)) {
        return
      }

      setter(file)
      previewSetter(preview)
    },
    [handleRequirePersonalInfo, protectedSectionEnabled, t],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!certificateFile) {
      setCertificateError(true)
      section1Ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      toast.error(
        t(
          'homePage.auth.accountManagement.brokerVerification.errors.certificateRequired',
        ),
      )
      return
    }

    if (!protectedSectionEnabled) {
      handleRequirePersonalInfo()
      return
    }

    if (!idFrontFile || !idBackFile) {
      setIdFrontError(!idFrontFile)
      setIdBackError(!idBackFile)
      section2Ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      toast.error(
        t(
          'homePage.auth.accountManagement.brokerVerification.errors.idImagesRequired',
        ),
      )
      return
    }

    try {
      setIsSubmitting(true)
      await Promise.resolve()
      toast.success(
        t('homePage.auth.accountManagement.brokerVerification.submitSuccess'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className='space-y-6'>
        <div className='flex items-center gap-3'>
          <FileCheck2 className='h-5 w-5 text-primary' />
          <Typography variant='h3' className='text-lg font-semibold'>
            {t('homePage.auth.accountManagement.brokerVerification.title')}
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <section ref={section1Ref} className='space-y-3'>
            <div className='space-y-1'>
              <h4 className='text-base font-semibold'>
                {t(
                  'homePage.auth.accountManagement.brokerVerification.section1Title',
                )}
              </h4>
              <p className='text-sm text-muted-foreground'>
                {t(
                  'homePage.auth.accountManagement.brokerVerification.section1Description',
                )}
              </p>
            </div>

            <UploadField
              label={t(
                'homePage.auth.accountManagement.brokerVerification.certificateLabel',
              )}
              helperText={t(
                'homePage.auth.accountManagement.brokerVerification.uploadCta',
              )}
              file={certificateFile}
              preview={certificatePreview}
              invalid={certificateError}
              errorText={t(
                'homePage.auth.accountManagement.brokerVerification.errors.certificateRequired',
              )}
              onFileChange={(file, preview) =>
                handleChangeImage(
                  file,
                  preview,
                  (nextFile) => {
                    setCertificateFile(nextFile)
                    if (nextFile) {
                      setCertificateError(false)
                    }
                  },
                  setCertificatePreview,
                )
              }
            />
          </section>

          <section ref={section2Ref} className='space-y-3'>
            <div className='space-y-1'>
              <h4 className='text-base font-semibold'>
                {t(
                  'homePage.auth.accountManagement.brokerVerification.section2Title',
                )}
              </h4>
              <p className='text-sm text-muted-foreground'>
                {t(
                  'homePage.auth.accountManagement.brokerVerification.section2Description',
                )}
              </p>
            </div>

            {!protectedSectionEnabled && (
              <Alert className='border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200'>
                <AlertCircle className='size-4' />
                <AlertTitle>
                  {t(
                    'homePage.auth.accountManagement.brokerVerification.personalInfoIncompleteTitle',
                  )}
                </AlertTitle>
                <AlertDescription>
                  <p>
                    {t(
                      'homePage.auth.accountManagement.brokerVerification.personalInfoIncompleteDescription',
                    )}
                  </p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={onRequirePersonalInfo}
                    className='mt-2'
                  >
                    {t(
                      'homePage.auth.accountManagement.brokerVerification.goToPersonalInfo',
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <p className='text-xs text-muted-foreground flex items-center gap-1'>
              <Upload className='size-3.5' />
              {t(
                'homePage.auth.accountManagement.brokerVerification.uploadHint',
              )}
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <UploadField
                label={t(
                  'homePage.auth.accountManagement.brokerVerification.idFrontLabel',
                )}
                helperText={t(
                  'homePage.auth.accountManagement.brokerVerification.uploadCta',
                )}
                file={idFrontFile}
                preview={idFrontPreview}
                invalid={idFrontError}
                errorText={t(
                  'homePage.auth.accountManagement.brokerVerification.errors.idImagesRequired',
                )}
                disabled={!protectedSectionEnabled}
                onFileChange={(file, preview) =>
                  handleChangeImage(
                    file,
                    preview,
                    (nextFile) => {
                      setIdFrontFile(nextFile)
                      if (nextFile) {
                        setIdFrontError(false)
                      }
                    },
                    setIdFrontPreview,
                    true,
                  )
                }
              />
              <UploadField
                label={t(
                  'homePage.auth.accountManagement.brokerVerification.idBackLabel',
                )}
                helperText={t(
                  'homePage.auth.accountManagement.brokerVerification.uploadCta',
                )}
                file={idBackFile}
                preview={idBackPreview}
                invalid={idBackError}
                errorText={t(
                  'homePage.auth.accountManagement.brokerVerification.errors.idImagesRequired',
                )}
                disabled={!protectedSectionEnabled}
                onFileChange={(file, preview) =>
                  handleChangeImage(
                    file,
                    preview,
                    (nextFile) => {
                      setIdBackFile(nextFile)
                      if (nextFile) {
                        setIdBackError(false)
                      }
                    },
                    setIdBackPreview,
                    true,
                  )
                }
              />
            </div>
          </section>

          <div className='flex justify-end pt-2'>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='min-w-[180px]'
            >
              <IdCard className='size-4 mr-1' />
              {isSubmitting
                ? t(
                    'homePage.auth.accountManagement.brokerVerification.submitting',
                  )
                : t(
                    'homePage.auth.accountManagement.brokerVerification.submit',
                  )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}

export { BrokerVerificationForm }
