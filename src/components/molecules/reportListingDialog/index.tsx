import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/tabs'
import { Label } from '@/components/atoms/label'
import { ReportCategory, ReportReason } from '@/api/types'
import { toast } from 'sonner'
import { useReportReasons, useCreateReport } from '@/hooks/useReport'
import { useAuthContext } from '@/contexts/auth'

interface ReportFormData {
  reasonIds: number[]
  otherFeedback?: string
  reporterName?: string
  reporterPhone?: string
  reporterEmail: string
  category: ReportCategory
}

export interface ReportListingDialogProps {
  listingId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const ReportListingDialog: React.FC<ReportListingDialogProps> = ({
  listingId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const t = useTranslations()
  const { user, isAuthenticated } = useAuthContext()

  const [activeCategory, setActiveCategory] =
    useState<ReportCategory>('LISTING')

  const { data: reasons = [], isLoading: loadingReasons } = useReportReasons()
  const { mutate: submitReport, isPending: submitting } = useCreateReport()

  const { control, handleSubmit, watch, setValue, reset } =
    useForm<ReportFormData>({
      defaultValues: {
        reasonIds: [],
        otherFeedback: '',
        reporterName: '',
        reporterPhone: '',
        reporterEmail: '',
        category: 'LISTING',
      },
    })

  const selectedReasonIds = watch('reasonIds')
  const reporterEmail = watch('reporterEmail')
  const reporterPhone = watch('reporterPhone')

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setValue('reporterEmail', user.email)
      if (user.firstName || user.lastName) {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        setValue('reporterName', fullName)
      }
      if (user.phoneNumber) {
        const fullPhone = `${user.phoneCode || ''}${user.phoneNumber}`.trim()
        setValue('reporterPhone', fullPhone)
      }
    }
  }, [isAuthenticated, user, open, setValue])

  useEffect(() => {
    if (!open) {
      reset()
      setActiveCategory('LISTING')
    }
  }, [open, reset])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset()
      setActiveCategory('LISTING')
    }
  }, [open, reset])

  const validatePhone = (value?: string) => {
    if (!value || !value.trim()) {
      return t('report.phoneRequired') || 'Số điện thoại là bắt buộc'
    }
    const phoneRegex = /^0\d{9,10}$/
    return (
      phoneRegex.test(value.trim()) ||
      t('report.invalidPhone') ||
      'Số điện thoại không hợp lệ'
    )
  }

  const validateEmail = (value?: string) => {
    if (!value || !value.trim()) {
      return t('report.emailRequired') || 'Email là bắt buộc'
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return (
      emailRegex.test(value.trim()) ||
      t('report.invalidEmail') ||
      'Email không hợp lệ'
    )
  }

  const toggleReasonSelection = (reasonId: number) => {
    const currentIds = watch('reasonIds')
    if (currentIds.includes(reasonId)) {
      setValue(
        'reasonIds',
        currentIds.filter((id) => id !== reasonId),
      )
    } else {
      setValue('reasonIds', [...currentIds, reasonId])
    }
  }

  const onSubmit = (data: ReportFormData) => {
    if (data.reasonIds.length === 0) {
      toast.error(
        t('common.selectReason') || 'Please select at least one reason',
      )
      return
    }

    submitReport(
      {
        listingId,
        data: {
          reasonIds: data.reasonIds,
          otherFeedback: data.otherFeedback?.trim() || undefined,
          reporterName: data.reporterName?.trim() || undefined,
          reporterPhone: data.reporterPhone?.trim() || undefined,
          reporterEmail: data.reporterEmail.trim(),
          category: activeCategory,
        },
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: (response: any) => {
          if (response?.success || response?.data) {
            toast.success(
              t('report.submitSuccess') || 'Báo cáo đã được gửi thành công',
            )
            reset()
            onOpenChange(false)
            onSuccess?.()
          } else {
            toast.error(
              (response?.message as string) ||
                t('report.submitError') ||
                'Gửi báo cáo thất bại',
            )
          }
        },
        onError: (error: Error) => {
          console.error('Failed to submit report:', error)
          toast.error(t('report.submitError') || 'Gửi báo cáo thất bại')
        },
      },
    )
  }

  const filteredReasons = reasons.filter(
    (r: ReportReason) => r.category === activeCategory,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='h-full w-full sm:h-auto sm:max-w-2xl sm:w-full max-h-screen sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 sm:rounded-lg rounded-none'>
        <DialogTitle className='text-lg sm:text-xl'>
          {t('common.report') || 'Report Listing'}
        </DialogTitle>
        <DialogDescription className='text-sm sm:text-base'>
          {t('common.reportDescription') ||
            'Help us improve by reporting issues with this listing'}
        </DialogDescription>

        <div className='space-y-3 sm:space-y-4 py-3 sm:py-4'>
          {/* Category Tabs */}
          <Tabs
            value={activeCategory}
            onValueChange={(v: string) =>
              setActiveCategory(v as ReportCategory)
            }
          >
            <TabsList className='grid w-full grid-cols-2 h-9 sm:h-10'>
              <TabsTrigger value='LISTING' className='text-xs sm:text-sm'>
                {t('common.reportCategory.listing') || 'Listing'}
              </TabsTrigger>
              <TabsTrigger value='MAP' className='text-xs sm:text-sm'>
                {t('common.reportCategory.map') || 'Map'}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value='LISTING'
              className='space-y-2 sm:space-y-3 mt-3 sm:mt-4'
            >
              {loadingReasons ? (
                <div className='text-center py-6 sm:py-4 text-xs sm:text-sm text-muted-foreground'>
                  {t('common.loading') || 'Loading...'}
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2'>
                  {filteredReasons.map((reason: ReportReason) => (
                    <div
                      key={reason.reasonId}
                      className='flex items-start space-x-2 sm:space-x-3 p-2.5 sm:p-2 rounded hover:bg-accent active:bg-accent transition-colors'
                    >
                      <input
                        type='checkbox'
                        id={`reason-listing-${reason.reasonId}`}
                        value={reason.reasonId}
                        checked={selectedReasonIds.includes(reason.reasonId)}
                        onChange={() => toggleReasonSelection(reason.reasonId)}
                        className='mt-0.5 sm:mt-1 w-4 h-4 sm:w-auto sm:h-auto flex-shrink-0'
                      />
                      <Label
                        htmlFor={`reason-listing-${reason.reasonId}`}
                        className='cursor-pointer flex-1 text-xs sm:text-sm leading-relaxed'
                      >
                        {reason.reasonText}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value='MAP'
              className='space-y-2 sm:space-y-3 mt-3 sm:mt-4'
            >
              {loadingReasons ? (
                <div className='text-center py-6 sm:py-4 text-xs sm:text-sm text-muted-foreground'>
                  {t('common.loading') || 'Loading...'}
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2'>
                  {filteredReasons.map((reason: ReportReason) => (
                    <div
                      key={reason.reasonId}
                      className='flex items-start space-x-2 sm:space-x-3 p-2.5 sm:p-2 rounded hover:bg-accent active:bg-accent transition-colors'
                    >
                      <input
                        type='checkbox'
                        id={`reason-map-${reason.reasonId}`}
                        value={reason.reasonId}
                        checked={selectedReasonIds.includes(reason.reasonId)}
                        onChange={() => toggleReasonSelection(reason.reasonId)}
                        className='mt-0.5 sm:mt-1 w-4 h-4 sm:w-auto sm:h-auto flex-shrink-0'
                      />
                      <Label
                        htmlFor={`reason-map-${reason.reasonId}`}
                        className='cursor-pointer flex-1 text-xs sm:text-sm leading-relaxed'
                      >
                        {reason.reasonText}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Other Feedback */}
          <div className='pt-2'>
            <Label className='text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block'>
              {t('report.otherFeedback') || 'Phản hồi khác (Tùy chọn)'}
            </Label>
            <Controller
              name='otherFeedback'
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder={
                    t('report.otherFeedbackPlaceholder') ||
                    'Nhập thêm chi tiết về vấn đề...'
                  }
                  className='w-full min-h-[80px] sm:min-h-[100px] p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 resize-none focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={submitting}
                />
              )}
            />
          </div>

          {/* Reporter Information */}
          <div className='space-y-2 sm:space-y-3'>
            <Label className='text-xs sm:text-sm font-medium block'>
              {t('report.reporterInfo') || 'Thông tin người báo cáo'}
              <span className='text-red-500 ml-1'>*</span>
            </Label>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='sm:col-span-2'>
                <Controller
                  name='reporterName'
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type='text'
                      placeholder={t('report.reporterName') || 'Họ và tên'}
                      className='w-full p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring'
                      disabled={submitting}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name='reporterPhone'
                  control={control}
                  rules={{ validate: validatePhone }}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        {...field}
                        type='tel'
                        placeholder={`${t('report.reporterPhone') || 'Số điện thoại'} *`}
                        className={`w-full p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring ${
                          fieldState.error ? 'border-red-500' : ''
                        }`}
                        disabled={submitting}
                        required
                      />
                      {fieldState.error && (
                        <p className='text-xs text-red-500 mt-1'>
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              <div>
                <Controller
                  name='reporterEmail'
                  control={control}
                  rules={{ validate: validateEmail }}
                  render={({ field, fieldState }) => (
                    <>
                      <div className='relative'>
                        <input
                          {...field}
                          type='email'
                          placeholder={`${t('report.reporterEmail') || 'Email'} *`}
                          className={`w-full p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring ${
                            fieldState.error ? 'border-red-500' : ''
                          }`}
                          disabled={
                            submitting || (isAuthenticated && !!user?.email)
                          }
                          required
                        />
                        {isAuthenticated && user?.email && (
                          <span className='absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                            {t('report.autoFilled') || 'Tự động điền'}
                          </span>
                        )}
                      </div>
                      {fieldState.error && (
                        <p className='text-xs text-red-500 mt-1'>
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-3 sm:pt-4 border-t'>
          <Button
            variant='outline'
            disabled={submitting || loadingReasons}
            onClick={() => onOpenChange(false)}
            className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
          >
            {t('common.cancel') || 'Hủy'}
          </Button>
          <Button
            disabled={
              submitting ||
              loadingReasons ||
              selectedReasonIds.length === 0 ||
              !reporterEmail.trim() ||
              !reporterPhone?.trim()
            }
            onClick={handleSubmit(onSubmit)}
            className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
          >
            {submitting
              ? t('report.submitting') || 'Đang gửi...'
              : t('report.submit') || 'Gửi báo cáo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
