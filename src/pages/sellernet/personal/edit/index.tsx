import * as React from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useUpdateProfile } from '@/hooks/useAuth'

const AccountManagementTemplate = dynamic(
  () => import('@/components/templates/accountManagementTemplate'),
  {
    ssr: false,
  },
)

type PersonalInfoFormData = {
  firstName?: string
  lastName?: string
  email?: string
  contactPhoneNumber?: string
  idDocument?: string
  avatar?: File
}

const TOAST_ID = 'profile-update'

const PersonalEditPage: NextPageWithLayout = () => {
  const { updateProfile, phase, avatarUploadProgress } = useUpdateProfile()

  // Surface the two-step flow (R2 upload → JSON profile save) via a single
  // dynamic toast so the user gets meaningful feedback during large avatar
  // uploads instead of an opaque spinner. The hook stays decoupled from UI.
  React.useEffect(() => {
    if (phase === 'uploading-avatar') {
      toast.loading(
        avatarUploadProgress > 0
          ? `Đang tải ảnh đại diện lên... ${avatarUploadProgress}%`
          : 'Đang tải ảnh đại diện lên...',
        { id: TOAST_ID },
      )
    } else if (phase === 'saving-profile') {
      toast.loading('Đang lưu thông tin...', { id: TOAST_ID })
    } else {
      toast.dismiss(TOAST_ID)
    }
  }, [phase, avatarUploadProgress])

  const handlePersonalInfoUpdate = async (
    data: PersonalInfoFormData,
  ): Promise<boolean> => {
    try {
      const result = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        idDocument: data.idDocument,
        contactPhoneNumber: data.contactPhoneNumber,
        avatar: data.avatar, // Hook uploads to R2 then PATCHes the profile
      })

      return result.success
    } catch (error) {
      console.error('Failed to update personal info:', error)
      return false
    }
  }

  return (
    <>
      <SeoHead title='Chỉnh sửa thông tin cá nhân – Sellernet' noindex />
      <AccountManagementTemplate
        onPersonalInfoUpdate={handlePersonalInfoUpdate}
      />
    </>
  )
}

export default PersonalEditPage

PersonalEditPage.getLayout = (page: React.ReactNode) => (
  <SellerLayout>{page}</SellerLayout>
)
