import * as React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import AccountManagementTemplate from '@/components/templates/accountManagementTemplate'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'

const AccountManagePage: NextPageWithLayout = () => {
  const handlePersonalInfoUpdate = async (): Promise<boolean> => {
    try {
      // TODO Call updateUser from useAuth hook

      return false
    } catch (error) {
      console.error('Failed to update personal info:', error)
      return false
    }
  }

  return (
    <>
      <SeoHead title='Quản lý tài khoản – Sellernet' noindex />
      <AccountManagementTemplate
        onPersonalInfoUpdate={handlePersonalInfoUpdate}
      />
    </>
  )
}

export default AccountManagePage

AccountManagePage.getLayout = (page: React.ReactNode) => (
  <SellernetLayout>{page}</SellernetLayout>
)
