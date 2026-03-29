import * as React from 'react'
import dynamic from 'next/dynamic'
import type { NextPageWithLayout } from '@/types/next-page'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
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
        contactPhoneNumber: data.contactPhoneNumber,
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
