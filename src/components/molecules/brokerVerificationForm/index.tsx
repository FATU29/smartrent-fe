import * as React from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { BrokerService } from '@/api/services/broker.service'
import { MediaService } from '@/api/services/media.service'
import type {
  BrokerRegisterRequest,
  BrokerStatusResponse,
  BrokerVerificationStatus,
} from '@/api/types/broker.type'
import { useAuth } from '@/hooks/useAuth'
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  IdCard,
  ImagePlus,
  Loader2,
  RefreshCcw,
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
  isUploading?: boolean
  uploadProgress?: number
  uploaded?: boolean
  onRetryUpload?: () => void
  retryText?: string
  uploadingText?: string
  uploadedText?: string
  disabled?: boolean
  invalid?: boolean
  errorText?: string
}

type DocumentKey = 'certificate' | 'idFront' | 'idBack'

type UploadState = Record<
  DocumentKey,
  {
    isUploading: boolean
    progress: number
    error: string | null
  }
>

type MediaIdState = Record<DocumentKey, number | null>

interface BrokerMutationError extends Error {
  code?: string
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]
const MAX_FILE_SIZE_MB = 10

const createInitialUploadState = (): UploadState => ({
  certificate: { isUploading: false, progress: 0, error: null },
  idFront: { isUploading: false, progress: 0, error: null },
  idBack: { isUploading: false, progress: 0, error: null },
})

const createInitialMediaIds = (): MediaIdState => ({
  certificate: null,
  idFront: null,
  idBack: null,
})

const withCodeError = (message: string, code?: string): BrokerMutationError => {
  const error = new Error(message) as BrokerMutationError
  error.code = code
  return error
}

const normalizeStatus = (
  status: string | null | undefined,
): BrokerVerificationStatus => {
  if (status === 'PENDING') return 'PENDING'
  if (status === 'APPROVED') return 'APPROVED'
  if (status === 'REJECTED') return 'REJECTED'
  return 'NONE'
}

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
  isUploading = false,
  uploadProgress = 0,
  uploaded = false,
  onRetryUpload,
  retryText = 'Retry upload',
  uploadingText = 'Uploading...',
  uploadedText = 'Uploaded',
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
          'rounded-xl border border-dashed p-4 transition-all duration-200 sm:p-5',
          invalid && 'border-destructive ring-2 ring-destructive/20',
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'hover:border-primary/70 hover:shadow-sm',
        )}
      >
        {preview ? (
          <div className='space-y-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={label}
              className='h-44 w-full rounded-lg border object-cover sm:h-48'
            />
            <div className='flex flex-wrap items-center justify-between gap-2.5'>
              <p className='text-xs text-muted-foreground truncate'>
                {file?.name}
              </p>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className='h-8 px-2 text-muted-foreground'
              >
                <X className='size-4' />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type='button'
            onClick={handlePick}
            disabled={disabled || isUploading}
            className='flex w-full flex-col items-center justify-center gap-2 py-8 text-center sm:py-10'
          >
            <ImagePlus className='size-5 text-muted-foreground' />
            <span className='text-sm font-medium'>{helperText}</span>
            <span className='text-xs text-muted-foreground'>
              JPG, PNG, WEBP - max {MAX_FILE_SIZE_MB}MB
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type='file'
          accept='image/jpeg,image/jpg,image/png,image/webp'
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className='hidden'
        />

        {isUploading && (
          <div className='mt-3 space-y-1.5'>
            <div className='inline-flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Loader2 className='size-3 animate-spin' />
              <span>
                {uploadingText}
                {uploadProgress > 0 ? ` ${uploadProgress}%` : ''}
              </span>
            </div>
            <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full bg-primary transition-all duration-200'
                style={{
                  width: `${Math.max(6, Math.min(uploadProgress, 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {!isUploading && uploaded && !invalid && (
          <p className='mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-600'>
            <CheckCircle2 className='size-3.5' />
            {uploadedText}
          </p>
        )}
      </div>

      {invalid && errorText && (
        <p className='text-xs text-destructive'>{errorText}</p>
      )}

      {!isUploading && invalid && onRetryUpload && file && (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onRetryUpload}
          className='h-8 px-2 text-xs'
        >
          <RefreshCcw className='mr-1 size-3.5' />
          {retryText}
        </Button>
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
  const safeT = React.useCallback(
    (key: string, fallback: string) => (t.has(key) ? t(key) : fallback),
    [t],
  )
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuth()

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
  const [isReapplyMode, setIsReapplyMode] = React.useState(false)
  const [uploadState, setUploadState] = React.useState<UploadState>(() =>
    createInitialUploadState(),
  )
  const [mediaIds, setMediaIds] = React.useState<MediaIdState>(() =>
    createInitialMediaIds(),
  )
  const [docLoadError, setDocLoadError] = React.useState<
    Record<string, boolean>
  >({})

  const section1Ref = React.useRef<HTMLElement>(null)
  const section2Ref = React.useRef<HTMLElement>(null)

  const brokerStatusQuery = useQuery({
    queryKey: ['broker-status'],
    queryFn: async (): Promise<BrokerStatusResponse> => {
      const response = await BrokerService.getStatus()

      if (!response.success || !response.data) {
        throw withCodeError(
          response.message ||
            safeT(
              'homePage.auth.accountManagement.brokerVerification.statusLoadError',
              'Unable to load broker verification status.',
            ),
          response.code,
        )
      }

      return response.data
    },
    enabled: Boolean(user),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.brokerVerificationStatus === 'PENDING' ? 30_000 : false,
  })

  const currentStatus = normalizeStatus(
    brokerStatusQuery.data?.brokerVerificationStatus ||
      user?.brokerVerificationStatus,
  )
  const certUrl =
    brokerStatusQuery.data?.certUrl ||
    brokerStatusQuery.data?.certFrontUrl ||
    null

  const documents = React.useMemo(
    () => [
      {
        key: 'cccdFront',
        label: t(
          'homePage.auth.accountManagement.brokerVerification.idFrontLabel',
        ),
        url: brokerStatusQuery.data?.cccdFrontUrl || null,
      },
      {
        key: 'cccdBack',
        label: t(
          'homePage.auth.accountManagement.brokerVerification.idBackLabel',
        ),
        url: brokerStatusQuery.data?.cccdBackUrl || null,
      },
      {
        key: 'certificate',
        label: t(
          'homePage.auth.accountManagement.brokerVerification.certificateLabel',
        ),
        url: certUrl,
      },
    ],
    [
      brokerStatusQuery.data?.cccdBackUrl,
      brokerStatusQuery.data?.cccdFrontUrl,
      certUrl,
      t,
    ],
  )

  const hasSubmittedDocuments = documents.some((doc) => Boolean(doc.url))
  const hasPreviewLoadError = Object.values(docLoadError).some(Boolean)
  const anyUploadInProgress = Object.values(uploadState).some(
    (state) => state.isUploading,
  )
  const allUploadsCompleted = Boolean(
    mediaIds.certificate && mediaIds.idFront && mediaIds.idBack,
  )

  const showReadOnlyStatus =
    currentStatus === 'PENDING' ||
    currentStatus === 'APPROVED' ||
    (currentStatus === 'REJECTED' && !isReapplyMode)
  const showForm =
    currentStatus === 'NONE' || (currentStatus === 'REJECTED' && isReapplyMode)

  React.useEffect(() => {
    if (!brokerStatusQuery.data) return

    updateUser({
      isBroker: brokerStatusQuery.data.isBroker,
      brokerVerificationStatus: brokerStatusQuery.data.brokerVerificationStatus,
    })
  }, [brokerStatusQuery.data, updateUser])

  React.useEffect(() => {
    if (currentStatus !== 'REJECTED') {
      setIsReapplyMode(false)
    }
  }, [currentStatus])

  React.useEffect(() => {
    setDocLoadError({})
  }, [
    brokerStatusQuery.data?.cccdFrontUrl,
    brokerStatusQuery.data?.cccdBackUrl,
    certUrl,
  ])

  const setUploadPatch = React.useCallback(
    (
      key: DocumentKey,
      patch: Partial<{
        isUploading: boolean
        progress: number
        error: string | null
      }>,
    ) => {
      setUploadState((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          ...patch,
        },
      }))
    },
    [],
  )

  const resetDocumentUploadState = React.useCallback((key: DocumentKey) => {
    setMediaIds((prev) => ({ ...prev, [key]: null }))
    setUploadState((prev) => ({
      ...prev,
      [key]: { isUploading: false, progress: 0, error: null },
    }))
  }, [])

  const resetLocalForm = React.useCallback(() => {
    setCertificateFile(null)
    setCertificatePreview(null)
    setIdFrontFile(null)
    setIdFrontPreview(null)
    setIdBackFile(null)
    setIdBackPreview(null)
    setCertificateError(false)
    setIdFrontError(false)
    setIdBackError(false)
    setUploadState(createInitialUploadState())
    setMediaIds(createInitialMediaIds())
  }, [])

  const resolveUploadErrorMessage = React.useCallback(
    (backendMessage?: string) =>
      backendMessage ||
      safeT(
        'homePage.auth.accountManagement.brokerVerification.errors.uploadFailed',
        'Upload failed, please re-select the file and try again.',
      ),
    [safeT],
  )

  const resolveRegisterErrorMessage = React.useCallback(
    (code?: string, backendMessage?: string) => {
      if (code === '17003') {
        return safeT(
          'homePage.auth.accountManagement.brokerVerification.errors.documentMissing',
          'A required document is missing. Please upload all documents.',
        )
      }
      if (code === '17004') {
        return safeT(
          'homePage.auth.accountManagement.brokerVerification.errors.documentNotFound',
          'A document was not found. Please upload again.',
        )
      }
      if (code === '17005') {
        return safeT(
          'homePage.auth.accountManagement.brokerVerification.errors.documentNotConfirmed',
          'Upload confirmation failed. Please re-select and upload again.',
        )
      }
      if (code === '17006') {
        return safeT(
          'homePage.auth.accountManagement.brokerVerification.errors.documentNotImage',
          'Only image files are accepted.',
        )
      }

      return (
        backendMessage ||
        safeT(
          'homePage.auth.accountManagement.brokerVerification.errors.submitFailed',
          'Unable to submit broker registration right now. Please try again.',
        )
      )
    },
    [safeT],
  )

  const uploadDocument = React.useCallback(
    async (key: DocumentKey, file: File) => {
      setUploadPatch(key, { isUploading: true, progress: 0, error: null })
      setMediaIds((prev) => ({ ...prev, [key]: null }))

      try {
        const response = await MediaService.uploadViaPresign(
          {
            file,
            mediaType: 'IMAGE',
            purpose: 'BROKER_DOCUMENT',
          },
          {
            onUploadProgress: (event) => {
              if (!event.total) return
              const progress = Math.round((event.loaded / event.total) * 100)
              setUploadPatch(key, { progress })
            },
          },
        )

        if (!response.success || !response.data) {
          throw withCodeError(
            resolveUploadErrorMessage(response.message || undefined),
            response.code,
          )
        }

        const mediaId = Number(response.data.mediaId)
        setMediaIds((prev) => ({ ...prev, [key]: mediaId }))
        setUploadPatch(key, { progress: 100, error: null })
      } catch (error) {
        const message = resolveUploadErrorMessage(
          error instanceof Error ? error.message : undefined,
        )
        setUploadPatch(key, { progress: 0, error: message })
        throw error
      } finally {
        setUploadPatch(key, { isUploading: false })
      }
    },
    [resolveUploadErrorMessage, setUploadPatch],
  )

  const registerMutation = useMutation({
    mutationFn: async (
      payload: BrokerRegisterRequest,
    ): Promise<BrokerStatusResponse> => {
      const response = await BrokerService.register(payload)

      if (!response.success || !response.data) {
        throw withCodeError(
          response.message ||
            safeT(
              'homePage.auth.accountManagement.brokerVerification.errors.submitFailed',
              'Unable to submit broker registration right now. Please try again.',
            ),
          response.code,
        )
      }

      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['broker-status'], data)
      queryClient.invalidateQueries({ queryKey: ['broker-status'] })
      updateUser({
        isBroker: data.isBroker,
        brokerVerificationStatus: data.brokerVerificationStatus,
      })
      setIsReapplyMode(false)
      resetLocalForm()
    },
    onError: (error) => {
      const mutationError = error as BrokerMutationError
      toast.error(
        resolveRegisterErrorMessage(mutationError.code, mutationError.message),
      )
    },
  })

  const handleRequirePersonalInfo = React.useCallback(() => {
    toast.warning(
      t(
        'homePage.auth.accountManagement.brokerVerification.personalInfoIncompleteToast',
      ),
    )
    onRequirePersonalInfo()
  }, [onRequirePersonalInfo, t])

  const protectedSectionEnabled = isPersonalInfoComplete

  const handleCertificateChange = React.useCallback(
    (file: File | null, preview: string | null) => {
      if (file && !validateImageFile(file, t)) {
        return
      }

      setCertificateFile(file)
      setCertificatePreview(preview)
      setCertificateError(false)
      resetDocumentUploadState('certificate')

      if (file) {
        void uploadDocument('certificate', file).catch(() => undefined)
      }
    },
    [resetDocumentUploadState, t, uploadDocument],
  )

  const handleIdFrontChange = React.useCallback(
    (file: File | null, preview: string | null) => {
      if (file && !protectedSectionEnabled) {
        handleRequirePersonalInfo()
        return
      }

      if (file && !validateImageFile(file, t)) {
        return
      }

      setIdFrontFile(file)
      setIdFrontPreview(preview)
      setIdFrontError(false)
      resetDocumentUploadState('idFront')

      if (file) {
        void uploadDocument('idFront', file).catch(() => undefined)
      }
    },
    [
      handleRequirePersonalInfo,
      protectedSectionEnabled,
      resetDocumentUploadState,
      t,
      uploadDocument,
    ],
  )

  const handleIdBackChange = React.useCallback(
    (file: File | null, preview: string | null) => {
      if (file && !protectedSectionEnabled) {
        handleRequirePersonalInfo()
        return
      }

      if (file && !validateImageFile(file, t)) {
        return
      }

      setIdBackFile(file)
      setIdBackPreview(preview)
      setIdBackError(false)
      resetDocumentUploadState('idBack')

      if (file) {
        void uploadDocument('idBack', file).catch(() => undefined)
      }
    },
    [
      handleRequirePersonalInfo,
      protectedSectionEnabled,
      resetDocumentUploadState,
      t,
      uploadDocument,
    ],
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

    if (anyUploadInProgress) {
      toast.warning(
        safeT(
          'homePage.auth.accountManagement.brokerVerification.uploadInProgress',
          'Documents are still uploading. Please wait for all uploads to finish.',
        ),
      )
      return
    }

    if (!allUploadsCompleted) {
      if (!mediaIds.certificate) {
        setUploadPatch('certificate', {
          error:
            uploadState.certificate.error ||
            resolveUploadErrorMessage(
              safeT(
                'homePage.auth.accountManagement.brokerVerification.errors.certificateRequired',
                'Please upload your broker license photo.',
              ),
            ),
        })
      }
      if (!mediaIds.idFront) {
        setUploadPatch('idFront', {
          error:
            uploadState.idFront.error ||
            resolveUploadErrorMessage(
              safeT(
                'homePage.auth.accountManagement.brokerVerification.errors.idImagesRequired',
                'Please upload both front and back images of your Citizen ID.',
              ),
            ),
        })
      }
      if (!mediaIds.idBack) {
        setUploadPatch('idBack', {
          error:
            uploadState.idBack.error ||
            resolveUploadErrorMessage(
              safeT(
                'homePage.auth.accountManagement.brokerVerification.errors.idImagesRequired',
                'Please upload both front and back images of your Citizen ID.',
              ),
            ),
        })
      }

      toast.error(
        safeT(
          'homePage.auth.accountManagement.brokerVerification.errors.uploadIncomplete',
          'Please make sure all required document uploads are completed.',
        ),
      )
      return
    }

    try {
      setIsSubmitting(true)
      const response = await registerMutation.mutateAsync({
        cccdFrontMediaId: mediaIds.idFront as number,
        cccdBackMediaId: mediaIds.idBack as number,
        certMediaId: mediaIds.certificate as number,
      })

      if (
        response.brokerVerificationStatus === 'APPROVED' ||
        response.isBroker
      ) {
        toast.success(
          safeT(
            'homePage.auth.accountManagement.brokerVerification.alreadyApproved',
            'You are already a verified broker.',
          ),
        )
      } else if (currentStatus === 'REJECTED') {
        toast.success(
          safeT(
            'homePage.auth.accountManagement.brokerVerification.resubmitSuccess',
            'Your application has been re-submitted and is now under review.',
          ),
        )
      } else {
        toast.success(
          t('homePage.auth.accountManagement.brokerVerification.submitSuccess'),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      className={cn(
        'border-border/80 bg-transparent p-4 shadow-[0_12px_32px_-24px_hsl(var(--foreground)/0.65)] sm:p-6 md:p-7',
        className,
      )}
    >
      <div className='space-y-5 sm:space-y-6'>
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-full border border-primary/30'>
            <FileCheck2 className='h-4.5 w-4.5 text-primary' />
          </div>
          <Typography
            variant='h3'
            className='text-base font-semibold sm:text-lg'
          >
            {t('homePage.auth.accountManagement.brokerVerification.title')}
          </Typography>
        </div>

        {brokerStatusQuery.isLoading && (
          <div className='inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground'>
            <Loader2 className='size-3.5 animate-spin' />
            {safeT(
              'homePage.auth.accountManagement.brokerVerification.statusLoading',
              'Loading broker status...',
            )}
          </div>
        )}

        {brokerStatusQuery.isError && (
          <Alert className='border-amber-300/80 bg-transparent text-amber-900 dark:text-amber-200'>
            <AlertCircle className='size-4' />
            <AlertTitle>
              {safeT(
                'homePage.auth.accountManagement.brokerVerification.statusLoadErrorTitle',
                'Unable to refresh broker status',
              )}
            </AlertTitle>
            <AlertDescription>
              <div className='flex flex-wrap items-center gap-2'>
                <span>
                  {safeT(
                    'homePage.auth.accountManagement.brokerVerification.statusLoadErrorHint',
                    'You can still upload and submit documents. We will retry status sync later.',
                  )}
                </span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    void brokerStatusQuery.refetch()
                  }}
                >
                  <RefreshCcw className='mr-1 size-3.5' />
                  {safeT(
                    'homePage.auth.accountManagement.brokerVerification.refreshStatus',
                    'Refresh status',
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showReadOnlyStatus && (
          <Alert
            className={cn(
              'bg-transparent',
              currentStatus === 'APPROVED' &&
                'border-emerald-300/80 text-emerald-700 dark:text-emerald-300',
              currentStatus === 'PENDING' &&
                'border-blue-300/80 text-blue-700 dark:text-blue-300',
              currentStatus === 'REJECTED' &&
                'border-amber-300/80 text-amber-900 dark:text-amber-200',
            )}
          >
            <AlertCircle className='size-4' />
            <AlertTitle>
              {currentStatus === 'APPROVED' &&
                safeT(
                  'homePage.auth.accountManagement.brokerVerification.approvedBadge',
                  'Verified Broker',
                )}
              {currentStatus === 'PENDING' &&
                safeT(
                  'homePage.auth.accountManagement.brokerVerification.pendingBadge',
                  'Verification in Progress',
                )}
              {currentStatus === 'REJECTED' &&
                safeT(
                  'homePage.auth.accountManagement.brokerVerification.rejectedBadge',
                  'Registration Rejected',
                )}
            </AlertTitle>
            <AlertDescription>
              {currentStatus === 'APPROVED' && (
                <p>
                  {safeT(
                    'homePage.auth.accountManagement.brokerVerification.approvedMessage',
                    'Your broker profile has been verified successfully.',
                  )}
                </p>
              )}

              {currentStatus === 'PENDING' && (
                <p>
                  {safeT(
                    'homePage.auth.accountManagement.brokerVerification.pendingMessage',
                    'Your broker verification application is under manual review.',
                  )}
                </p>
              )}

              {currentStatus === 'REJECTED' && (
                <div className='space-y-2'>
                  <p>
                    {safeT(
                      'homePage.auth.accountManagement.brokerVerification.rejectedMessage',
                      'Your previous submission was rejected. Please re-apply with new documents.',
                    )}
                  </p>

                  {brokerStatusQuery.data?.brokerRejectionReason && (
                    <p className='text-xs'>
                      {safeT(
                        'homePage.auth.accountManagement.brokerVerification.rejectionReasonLabel',
                        'Reason:',
                      )}{' '}
                      {brokerStatusQuery.data.brokerRejectionReason}
                    </p>
                  )}

                  {!isReapplyMode && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        resetLocalForm()
                        setIsReapplyMode(true)
                      }}
                    >
                      {safeT(
                        'homePage.auth.accountManagement.brokerVerification.reapply',
                        'Re-apply with New Documents',
                      )}
                    </Button>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {hasSubmittedDocuments && (
          <section className='space-y-3 rounded-2xl border p-4 sm:p-5'>
            <div className='flex items-start justify-between gap-2'>
              <div>
                <h4 className='text-sm font-semibold'>
                  {safeT(
                    'homePage.auth.accountManagement.brokerVerification.submittedDocsTitle',
                    'Submitted Documents',
                  )}
                </h4>
                <p className='text-xs text-muted-foreground'>
                  {safeT(
                    'homePage.auth.accountManagement.brokerVerification.submittedDocsHint',
                    'These presigned links may expire. Refresh status to load fresh URLs.',
                  )}
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  void brokerStatusQuery.refetch()
                }}
              >
                <RefreshCcw className='mr-1 size-3.5' />
                {safeT(
                  'homePage.auth.accountManagement.brokerVerification.refreshStatus',
                  'Refresh status',
                )}
              </Button>
            </div>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              {documents.map((document) => {
                const loadFailed = Boolean(docLoadError[document.key])

                return (
                  <div
                    key={document.key}
                    className='space-y-2 rounded-xl border p-3'
                  >
                    <p className='text-xs font-medium text-muted-foreground'>
                      {document.label}
                    </p>

                    {document.url && !loadFailed ? (
                      <a
                        href={document.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block overflow-hidden rounded-lg border'
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={document.url}
                          alt={document.label}
                          className='h-36 w-full object-cover'
                          onError={() =>
                            setDocLoadError((prev) => ({
                              ...prev,
                              [document.key]: true,
                            }))
                          }
                        />
                      </a>
                    ) : (
                      <div className='flex h-36 items-center justify-center rounded-lg border bg-muted/30 px-2 text-center text-xs text-muted-foreground'>
                        {safeT(
                          'homePage.auth.accountManagement.brokerVerification.docUnavailable',
                          'Document preview unavailable. Please refresh status.',
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {hasPreviewLoadError && (
              <Alert className='border-amber-300/80 bg-transparent text-amber-900 dark:text-amber-200'>
                <AlertCircle className='size-4' />
                <AlertDescription>
                  {safeT(
                    'homePage.auth.accountManagement.brokerVerification.docExpiredHint',
                    'One or more document URLs may be expired. Refresh status to request fresh links.',
                  )}
                </AlertDescription>
              </Alert>
            )}
          </section>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className='space-y-5 sm:space-y-6'>
            <section
              ref={section1Ref}
              className='space-y-4 rounded-2xl border p-4 sm:p-5'
            >
              <div className='flex items-start justify-between gap-3'>
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
                <span className='shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground'>
                  Step 1
                </span>
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
                isUploading={uploadState.certificate.isUploading}
                uploadProgress={uploadState.certificate.progress}
                uploaded={Boolean(mediaIds.certificate)}
                uploadingText={safeT(
                  'homePage.auth.accountManagement.brokerVerification.uploading',
                  'Uploading...',
                )}
                uploadedText={safeT(
                  'homePage.auth.accountManagement.brokerVerification.uploaded',
                  'Uploaded',
                )}
                retryText={safeT(
                  'homePage.auth.accountManagement.brokerVerification.retryUpload',
                  'Retry upload',
                )}
                invalid={
                  certificateError || Boolean(uploadState.certificate.error)
                }
                errorText={
                  uploadState.certificate.error ||
                  (certificateError
                    ? t(
                        'homePage.auth.accountManagement.brokerVerification.errors.certificateRequired',
                      )
                    : undefined)
                }
                onRetryUpload={() => {
                  if (!certificateFile) return
                  void uploadDocument('certificate', certificateFile).catch(
                    () => undefined,
                  )
                }}
                onFileChange={handleCertificateChange}
              />
            </section>

            <section
              ref={section2Ref}
              className='space-y-4 rounded-2xl border p-4 sm:p-5'
            >
              <div className='flex items-start justify-between gap-3'>
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
                <span className='shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground'>
                  Step 2
                </span>
              </div>

              {!protectedSectionEnabled && (
                <Alert className='border-amber-300/80 bg-transparent text-amber-900 dark:text-amber-200'>
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

              <p className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground'>
                <Upload className='size-3.5' />
                {t(
                  'homePage.auth.accountManagement.brokerVerification.uploadHint',
                )}
              </p>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5'>
                <UploadField
                  label={t(
                    'homePage.auth.accountManagement.brokerVerification.idFrontLabel',
                  )}
                  helperText={t(
                    'homePage.auth.accountManagement.brokerVerification.uploadCta',
                  )}
                  file={idFrontFile}
                  preview={idFrontPreview}
                  isUploading={uploadState.idFront.isUploading}
                  uploadProgress={uploadState.idFront.progress}
                  uploaded={Boolean(mediaIds.idFront)}
                  uploadingText={safeT(
                    'homePage.auth.accountManagement.brokerVerification.uploading',
                    'Uploading...',
                  )}
                  uploadedText={safeT(
                    'homePage.auth.accountManagement.brokerVerification.uploaded',
                    'Uploaded',
                  )}
                  retryText={safeT(
                    'homePage.auth.accountManagement.brokerVerification.retryUpload',
                    'Retry upload',
                  )}
                  invalid={idFrontError || Boolean(uploadState.idFront.error)}
                  errorText={
                    uploadState.idFront.error ||
                    (idFrontError
                      ? t(
                          'homePage.auth.accountManagement.brokerVerification.errors.idImagesRequired',
                        )
                      : undefined)
                  }
                  disabled={!protectedSectionEnabled}
                  onRetryUpload={() => {
                    if (!idFrontFile) return
                    void uploadDocument('idFront', idFrontFile).catch(
                      () => undefined,
                    )
                  }}
                  onFileChange={handleIdFrontChange}
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
                  isUploading={uploadState.idBack.isUploading}
                  uploadProgress={uploadState.idBack.progress}
                  uploaded={Boolean(mediaIds.idBack)}
                  uploadingText={safeT(
                    'homePage.auth.accountManagement.brokerVerification.uploading',
                    'Uploading...',
                  )}
                  uploadedText={safeT(
                    'homePage.auth.accountManagement.brokerVerification.uploaded',
                    'Uploaded',
                  )}
                  retryText={safeT(
                    'homePage.auth.accountManagement.brokerVerification.retryUpload',
                    'Retry upload',
                  )}
                  invalid={idBackError || Boolean(uploadState.idBack.error)}
                  errorText={
                    uploadState.idBack.error ||
                    (idBackError
                      ? t(
                          'homePage.auth.accountManagement.brokerVerification.errors.idImagesRequired',
                        )
                      : undefined)
                  }
                  disabled={!protectedSectionEnabled}
                  onRetryUpload={() => {
                    if (!idBackFile) return
                    void uploadDocument('idBack', idBackFile).catch(
                      () => undefined,
                    )
                  }}
                  onFileChange={handleIdBackChange}
                />
              </div>

              <p className='text-xs text-muted-foreground'>
                {anyUploadInProgress
                  ? safeT(
                      'homePage.auth.accountManagement.brokerVerification.uploadInProgress',
                      'Documents are still uploading. Please wait for all uploads to finish.',
                    )
                  : allUploadsCompleted
                    ? safeT(
                        'homePage.auth.accountManagement.brokerVerification.readyToSubmit',
                        'All documents uploaded. You can submit your application now.',
                      )
                    : safeT(
                        'homePage.auth.accountManagement.brokerVerification.uploadRequiredHint',
                        'Upload all required documents to enable submission.',
                      )}
              </p>
            </section>

            <div className='flex justify-end pt-1'>
              <Button
                type='submit'
                disabled={
                  isSubmitting ||
                  registerMutation.isPending ||
                  anyUploadInProgress ||
                  !allUploadsCompleted
                }
                className='w-full sm:min-w-[190px] sm:w-auto'
              >
                <IdCard className='size-4 mr-1' />
                {isSubmitting || registerMutation.isPending
                  ? t(
                      'homePage.auth.accountManagement.brokerVerification.submitting',
                    )
                  : t(
                      'homePage.auth.accountManagement.brokerVerification.submit',
                    )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}

export { BrokerVerificationForm }
