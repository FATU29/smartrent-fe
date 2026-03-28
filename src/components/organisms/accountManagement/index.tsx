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
import { useChangePassword } from '@/hooks/useAuth/useChangePassword'
import { User, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/api/services/user.service'
import { useQuery } from '@tanstack/react-query'

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
  className?: string
}

const AccountManagement: NextPage<AccountManagementProps> = ({
  onPersonalInfoUpdate,
  className,
}) => {
  const t = useTranslations()
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = React.useState('personal-info')
  const [isUpdatingPersonalInfo, setIsUpdatingPersonalInfo] =
    React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const { data: profileResponse, isLoading: isProfileLoading } = useQuery({
    queryKey: ['sellernet', 'personal-edit-profile'],
    queryFn: () => UserService.getProfile(),
    enabled: Boolean(user),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    retry: false,
  })

  React.useEffect(() => {
    if (profileResponse?.data) {
      updateUser(profileResponse.data)
    }
  }, [profileResponse?.data, updateUser])

  const profileUser = profileResponse?.data ?? user

  const getUserInitialData = React.useMemo(() => {
    if (!profileUser) return undefined

    return {
      firstName: profileUser.firstName || '',
      lastName: profileUser.lastName || '',
      email: profileUser.email,
      phoneNumber: profileUser.phoneNumber || '',
      idDocument: profileUser.idDocument || '',
      taxNumber: profileUser.taxNumber || '',
      avatarUrl: profileUser.avatarUrl,
    }
  }, [profileUser])

  const handlePersonalInfoSubmit = async (data: PersonalInfoData) => {
    if (!onPersonalInfoUpdate) {
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

  const { mutateAsync: changePasswordMutation, isPending: isChanging } =
    useChangePassword()

  const handlePasswordChangeSubmit = async (data: PasswordChangeData) => {
    try {
      setIsChangingPassword(true)
      await changePasswordMutation({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success(
        t('homePage.auth.accountManagement.passwordChange.changeSuccess'),
      )
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(
        t('homePage.auth.accountManagement.passwordChange.changeError'),
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
          {isProfileLoading ? (
            <PersonalInfoFormSkeleton />
          ) : (
            <PersonalInfoForm
              initialData={getUserInitialData}
              onSubmit={handlePersonalInfoSubmit}
              loading={isUpdatingPersonalInfo}
            />
          )}
        </TabsContent>

        <TabsContent value='account-settings' className='space-y-6'>
          <PasswordChangeForm
            onSubmit={handlePasswordChangeSubmit}
            loading={isChangingPassword || isChanging}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const PersonalInfoFormSkeleton = () => {
  return (
    <div className='rounded-lg border bg-card p-6'>
      <div className='space-y-6 animate-pulse'>
        <div className='h-6 w-56 rounded-md bg-muted' />
        <div className='mx-auto h-28 w-28 rounded-full bg-muted' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
          <div className='h-10 rounded-md bg-muted' />
          <div className='h-10 rounded-md bg-muted' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
          <div className='h-10 rounded-md bg-muted' />
          <div className='h-10 rounded-md bg-muted' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
          <div className='h-10 rounded-md bg-muted' />
          <div className='h-10 rounded-md bg-muted' />
        </div>
        <div className='h-10 rounded-md bg-muted' />
      </div>
    </div>
  )
}

export default AccountManagement
