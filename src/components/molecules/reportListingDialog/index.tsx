import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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

  const [selectedReasonIds, setSelectedReasonIds] = useState<number[]>([])
  const [otherFeedback, setOtherFeedback] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [activeCategory, setActiveCategory] =
    useState<ReportCategory>('LISTING')

  // React Query hooks
  const { data: reasons = [], isLoading: loadingReasons } = useReportReasons()
  const { mutate: submitReport, isPending: submitting } = useCreateReport()

  // Auto-fill email from user token when logged in
  useEffect(() => {
    if (isAuthenticated && user?.email && !reporterEmail) {
      setReporterEmail(user.email)
      // Also auto-fill name if available
      if (user.firstName || user.lastName) {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        setReporterName(fullName)
      }
      // Auto-fill phone if available
      if (user.phoneNumber) {
        const fullPhone = `${user.phoneCode || ''}${user.phoneNumber}`.trim()
        setReporterPhone(fullPhone)
      }
    }
  }, [isAuthenticated, user, open])

  // Debug logging
  console.log('ReportListingDialog - reasons:', reasons)
  console.log('ReportListingDialog - isLoading:', loadingReasons)
  console.log('ReportListingDialog - activeCategory:', activeCategory)

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) {
      setPhoneError('')
      return true
    }
    // Vietnamese phone number: 10-11 digits, starts with 0
    const phoneRegex = /^0\d{9,10}$/
    if (!phoneRegex.test(phone.trim())) {
      setPhoneError(t('report.invalidPhone') || 'Số điện thoại không hợp lệ')
      return false
    }
    setPhoneError('')
    return true
  }

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError(t('report.emailRequired') || 'Email là bắt buộc')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setEmailError(t('report.invalidEmail') || 'Email không hợp lệ')
      return false
    }
    setEmailError('')
    return true
  }

  // Toggle checkbox selection
  const toggleReasonSelection = (reasonId: number) => {
    setSelectedReasonIds((prev) =>
      prev.includes(reasonId)
        ? prev.filter((id) => id !== reasonId)
        : [...prev, reasonId],
    )
  }

  const handleSubmitReport = () => {
    if (selectedReasonIds.length === 0) {
      toast.error(
        t('common.selectReason') || 'Please select at least one reason',
      )
      return
    }

    // Validate email (required) and phone (optional)
    const isEmailValid = validateEmail(reporterEmail)
    const isPhoneValid = validatePhone(reporterPhone)

    if (!isEmailValid || !isPhoneValid) {
      return
    }

    submitReport(
      {
        listingId,
        data: {
          reasonIds: selectedReasonIds,
          otherFeedback: otherFeedback.trim() || undefined,
          reporterName: reporterName.trim() || undefined,
          reporterPhone: reporterPhone.trim() || undefined,
          reporterEmail: reporterEmail.trim() || undefined,
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

            // Reset form
            setSelectedReasonIds([])
            setOtherFeedback('')
            setReporterName('')
            setReporterPhone('')
            setReporterEmail('')
            setPhoneError('')
            setEmailError('')
            setActiveCategory('LISTING')

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

  console.log('ReportListingDialog - filteredReasons:', filteredReasons)

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
            <textarea
              placeholder={
                t('report.otherFeedbackPlaceholder') ||
                'Nhập thêm chi tiết về vấn đề...'
              }
              value={otherFeedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setOtherFeedback(e.target.value)
              }
              className='w-full min-h-[80px] sm:min-h-[100px] p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 resize-none focus:outline-none focus:ring-2 focus:ring-ring'
              disabled={submitting}
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
                <input
                  type='text'
                  placeholder={t('report.reporterName') || 'Họ và tên'}
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className='w-full p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring'
                  disabled={submitting}
                />
              </div>

              <div>
                <input
                  type='tel'
                  placeholder={t('report.reporterPhone') || 'Số điện thoại'}
                  value={reporterPhone}
                  onChange={(e) => {
                    setReporterPhone(e.target.value)
                    if (e.target.value) validatePhone(e.target.value)
                  }}
                  onBlur={() => validatePhone(reporterPhone)}
                  className={`w-full p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring ${
                    phoneError ? 'border-red-500' : ''
                  }`}
                  disabled={submitting}
                />
                {phoneError && (
                  <p className='text-xs text-red-500 mt-1'>{phoneError}</p>
                )}
              </div>

              <div>
                <div className='relative'>
                  <input
                    type='email'
                    placeholder={`${t('report.reporterEmail') || 'Email'} *`}
                    value={reporterEmail}
                    onChange={(e) => {
                      setReporterEmail(e.target.value)
                      if (e.target.value) validateEmail(e.target.value)
                    }}
                    onBlur={() => validateEmail(reporterEmail)}
                    className={`w-full p-2 sm:p-2.5 border rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring ${
                      emailError ? 'border-red-500' : ''
                    }`}
                    disabled={submitting || (isAuthenticated && !!user?.email)}
                    required
                  />
                  {isAuthenticated && user?.email && (
                    <span className='absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                      {t('report.autoFilled') || 'Tự động điền'}
                    </span>
                  )}
                </div>
                {emailError && (
                  <p className='text-xs text-red-500 mt-1'>{emailError}</p>
                )}
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
              !reporterEmail.trim()
            }
            onClick={handleSubmitReport}
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
