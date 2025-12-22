import * as React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import AccountManagementTemplate from '@/components/templates/accountManagementTemplate'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useUpdateProfile } from '@/hooks/useAuth'

type PersonalInfoFormData = {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  idDocument?: string
  taxNumber?: string
  avatar?: File
}

const PersonalEditPage: NextPageWithLayout = () => {
  const { updateProfile } = useUpdateProfile()

  const handlePersonalInfoUpdate = async (
    data: PersonalInfoFormData,
  ): Promise<boolean> => {
    try {
      const result = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        idDocument: data.idDocument,
        taxNumber: data.taxNumber,
        contactPhoneNumber: data.phoneNumber,
        avatar: data.avatar, // Include avatar file
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
  <SellernetLayout>{page}</SellernetLayout>
)
