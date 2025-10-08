import * as React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import AccountManagementTemplate from '@/components/templates/accountManagementTemplate'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useAuth } from '@/hooks/useAuth'

type PersonalInfoFormData = {
  firstName?: string
  lastName?: string
  email?: string
}

const PersonalEditPage: NextPageWithLayout = () => {
  const { updateUser, user } = useAuth()

  const handlePersonalInfoUpdate = async (
    data: PersonalInfoFormData,
  ): Promise<boolean> => {
    try {
      // Optimistic update – in real case you'd call API then update store
      updateUser({
        firstName: data.firstName ?? user?.firstName,
        lastName: data.lastName ?? user?.lastName,
        email: data.email ?? user?.email,
      })
      return true
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
