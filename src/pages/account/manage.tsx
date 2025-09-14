import * as React from 'react'
import { NextPage } from 'next'
import { useTranslations } from 'next-intl'
import AccountManagementTemplate from '@/components/templates/accountManagementTemplate'
import { useAuth, useUpdateProfile, useChangePassword } from '@/hooks/useAuth'

type PersonalInfoData = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  idDocument: string
  taxNumber?: string
  avatar?: File
}

type PasswordChangeData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const AccountManagePage: NextPage = () => {
  const t = useTranslations()
  const { user, updateUser, isAuthenticated } = useAuth()
  const { updateUserProfile } = useUpdateProfile()
  const { changePassword } = useChangePassword()

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <h1 className='text-2xl font-bold'>
            {t('homePage.auth.accountManagement.loginRequired.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('homePage.auth.accountManagement.loginRequired.description')}
          </p>
        </div>
      </div>
    )
  }

  // Get initial user data from auth state
  const initialUserData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    idDocument: user.idDocument,
    taxNumber: user.taxNumber,
  }

  const handlePersonalInfoUpdate = async (
    data: PersonalInfoData,
  ): Promise<boolean> => {
    try {
      // Update user profile using the auth hook
      const result = await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        idDocument: data.idDocument,
        taxNumber: data.taxNumber,
      })

      if (result.success) {
        // Update local auth state immediately for better UX
        updateUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          idDocument: data.idDocument,
          taxNumber: data.taxNumber,
        })

        // Handle avatar upload if provided
        if (data.avatar) {
          // In a real app, you'd upload the avatar file to a storage service
          console.log('Avatar file to upload:', data.avatar)
          // await uploadAvatar(data.avatar)
        }
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to update personal info:', error)
      return false
    }
  }

  const handlePasswordChange = async (
    data: PasswordChangeData,
  ): Promise<boolean> => {
    try {
      // Use the password change hook
      const result = await changePassword(
        data.currentPassword,
        data.newPassword,
      )

      return result.success
    } catch (error) {
      console.error('Failed to change password:', error)
      return false
    }
  }

  return (
    <AccountManagementTemplate
      initialUserData={initialUserData}
      onPersonalInfoUpdate={handlePersonalInfoUpdate}
      onPasswordChange={handlePasswordChange}
    />
  )
}

export default AccountManagePage
