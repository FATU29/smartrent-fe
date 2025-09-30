import * as React from 'react'
import { NextPage } from 'next'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/tabs'
import { PersonalInfoForm } from '@/components/molecules/personalInfoForm'
import { PasswordChangeForm } from '@/components/molecules/passwordChangeForm'
import { User, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

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

type AccountManagementProps = {
  onPersonalInfoUpdate?: (data: PersonalInfoData) => Promise<boolean>
  onPasswordChange?: (data: PasswordChangeData) => Promise<boolean>
  className?: string
}

const AccountManagement: NextPage<AccountManagementProps> = ({
  onPersonalInfoUpdate,
  onPasswordChange,
  className,
}) => {
  const t = useTranslations()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = React.useState('personal-info')
  const [isUpdatingPersonalInfo, setIsUpdatingPersonalInfo] =
    React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)

  const handlePersonalInfoSubmit = async (data: PersonalInfoData) => {
    if (!onPersonalInfoUpdate) {
      // Form already syncs to store internally; no extra API call.
      return
    }

    try {
      setIsUpdatingPersonalInfo(true)
      const success = await onPersonalInfoUpdate(data)

      if (success) {
        toast.success(
          t('homePage.auth.accountManagement.personalInfo.updateSuccess'),
        )
      } else {
        toast.error(
          t('homePage.auth.accountManagement.personalInfo.updateError'),
        )
      }
    } catch (error) {
      console.error('Personal info update error:', error)
      toast.error(
        t('homePage.auth.accountManagement.personalInfo.updateErrorGeneral'),
      )
    } finally {
      setIsUpdatingPersonalInfo(false)
    }
  }

  const handlePasswordChangeSubmit = async (data: PasswordChangeData) => {
    if (!onPasswordChange) {
      toast.error(
        t(
          'homePage.auth.accountManagement.passwordChange.changeNotImplemented',
        ),
      )
      return
    }

    try {
      setIsChangingPassword(true)
      const success = await onPasswordChange(data)

      if (success) {
        toast.success(
          t('homePage.auth.accountManagement.passwordChange.changeSuccess'),
        )
      } else {
        toast.error(
          t('homePage.auth.accountManagement.passwordChange.changeError'),
        )
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(
        t('homePage.auth.accountManagement.passwordChange.changeErrorGeneral'),
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2 mb-6'>
          <TabsTrigger
            value='personal-info'
            className='flex items-center gap-2'
          >
            <User className='h-4 w-4' />
            {t('homePage.auth.accountManagement.personalInfoTab')}
          </TabsTrigger>
          <TabsTrigger
            value='account-settings'
            className='flex items-center gap-2'
          >
            <Lock className='h-4 w-4' />
            {t('homePage.auth.accountManagement.accountSettingsTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='personal-info' className='space-y-6'>
          <PersonalInfoForm
            initialData={user || undefined}
            onSubmit={handlePersonalInfoSubmit}
            loading={isUpdatingPersonalInfo}
          />
        </TabsContent>

        <TabsContent value='account-settings' className='space-y-6'>
          <PasswordChangeForm
            onSubmit={handlePasswordChangeSubmit}
            loading={isChangingPassword}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AccountManagement
