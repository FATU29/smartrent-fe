import * as React from 'react'
import { NextPage } from 'next'
import AccountManagement from '@/components/organisms/accountManagement'
import { cn } from '@/lib/utils'

// Personal info + password types kept local for future extension
type PersonalInfoData = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  idDocument: string
  taxNumber?: string
  avatar?: File
}

type AccountManagementTemplateProps = {
  onPersonalInfoUpdate?: (data: PersonalInfoData) => Promise<boolean>
  className?: string
}

const AccountManagementTemplate: NextPage<AccountManagementTemplateProps> = ({
  onPersonalInfoUpdate,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Main Content */}
      <main className='container mx-auto  md:py-8 md:px-4'>
        <AccountManagement onPersonalInfoUpdate={onPersonalInfoUpdate} />
      </main>
    </div>
  )
}

export default AccountManagementTemplate
