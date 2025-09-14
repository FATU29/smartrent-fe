import * as React from 'react'
import { NextPage } from 'next'
import AccountManagement from '@/components/organisms/accountManagement'
import { cn } from '@/lib/utils'

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

type AccountManagementTemplateProps = {
  initialUserData?: Partial<PersonalInfoData>
  onPersonalInfoUpdate?: (data: PersonalInfoData) => Promise<boolean>
  onPasswordChange?: (data: PasswordChangeData) => Promise<boolean>
  className?: string
}

const AccountManagementTemplate: NextPage<AccountManagementTemplateProps> = ({
  initialUserData,
  onPersonalInfoUpdate,
  onPasswordChange,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        <AccountManagement
          initialUserData={initialUserData}
          onPersonalInfoUpdate={onPersonalInfoUpdate}
          onPasswordChange={onPasswordChange}
        />
      </main>
    </div>
  )
}

export default AccountManagementTemplate
