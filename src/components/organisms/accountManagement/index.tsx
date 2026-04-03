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
import { BrokerVerificationForm } from '@/components/molecules/brokerVerificationForm'
import { useChangePassword } from '@/hooks/useAuth/useChangePassword'
import {
  User,
  Lock,
  ShieldCheck,
  Search,
  Gift,
  BadgeCheck,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/api/services/user.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

type PersonalInfoData = {
  firstName: string
  lastName: string
  email: string
  contactPhoneNumber: string
  idDocument: string
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
  const router = useRouter()
  const safeT = React.useCallback(
    (key: string, fallback: string) => (t.has(key) ? t(key) : fallback),
    [t],
  )
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = React.useState('personal-info')
  const [isUpdatingPersonalInfo, setIsUpdatingPersonalInfo] =
    React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['sellernet', 'personal-edit-profile'],
    queryFn: () => UserService.getProfile(),
    enabled: Boolean(user),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  React.useEffect(() => {
    if (profileResponse?.data) {
      updateUser(profileResponse.data)
    }
  }, [profileResponse?.data, updateUser])

  const profileUser = profileResponse?.data ?? user

  const isPersonalInfoComplete = React.useMemo(() => {
    if (!profileUser) return false

    const hasFirstName = Boolean(profileUser.firstName?.trim())
    const hasLastName = Boolean(profileUser.lastName?.trim())
    const hasPhone = Boolean(
      (profileUser.contactPhoneNumber || profileUser.phoneNumber || '').trim(),
    )
    const hasAvatar = Boolean(profileUser.avatarUrl?.trim())

    return hasFirstName && hasLastName && hasPhone && hasAvatar
  }, [profileUser])

  const getUserInitialData = React.useMemo(() => {
    if (!profileUser) return undefined

    return {
      firstName: profileUser.firstName || '',
      lastName: profileUser.lastName || '',
      email: profileUser.email,
      contactPhoneNumber:
        profileUser.contactPhoneNumber || profileUser.phoneNumber || '',
      idDocument: profileUser.idDocument || '',
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
        // Refetch profile to re-populate the form with latest values
        await refetchProfile()
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

  const handleRequirePersonalInfo = React.useCallback(() => {
    setActiveTab('personal-info')
  }, [])

  React.useEffect(() => {
    const queryTab = router.query.tab
    const tabFromQuery = Array.isArray(queryTab) ? queryTab[0] : queryTab

    if (tabFromQuery === 'broker-verification') {
      setActiveTab('broker-verification')
      return
    }

    if (tabFromQuery === 'account-settings') {
      setActiveTab('account-settings')
      return
    }

    if (tabFromQuery === 'personal-info') {
      setActiveTab('personal-info')
    }
  }, [router.query.tab])

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3 mb-6 h-auto gap-1'>
          <TabsTrigger
            value='personal-info'
            className='flex min-w-0 items-center justify-center gap-1.5 px-2 py-2 text-[11px] leading-tight sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm'
          >
            <User className='hidden sm:inline-block h-4 w-4' />
            <span className='truncate sm:hidden'>
              {safeT(
                'homePage.auth.accountManagement.personalInfoTabShort',
                'Info',
              )}
            </span>
            <span className='hidden sm:inline truncate'>
              {t('homePage.auth.accountManagement.personalInfoTab')}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='account-settings'
            className='flex min-w-0 items-center justify-center gap-1.5 px-2 py-2 text-[11px] leading-tight sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm'
          >
            <Lock className='hidden sm:inline-block h-4 w-4' />
            <span className='truncate sm:hidden'>
              {safeT(
                'homePage.auth.accountManagement.accountSettingsTabShort',
                'Password',
              )}
            </span>
            <span className='hidden sm:inline truncate'>
              {t('homePage.auth.accountManagement.accountSettingsTab')}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='broker-verification'
            className='flex min-w-0 items-center justify-center gap-1.5 px-2 py-2 text-[11px] leading-tight sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm'
          >
            <ShieldCheck className='hidden sm:inline-block h-4 w-4' />
            <span className='truncate sm:hidden'>
              {safeT(
                'homePage.auth.accountManagement.brokerVerificationTabShort',
                'Broker',
              )}
            </span>
            <span className='hidden sm:inline truncate'>
              {safeT(
                'homePage.auth.accountManagement.brokerVerificationTab',
                'Môi giới BĐS',
              )}
            </span>
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

        <TabsContent value='broker-verification' className='space-y-6'>
          <div className='rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 p-5 md:p-6 shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='size-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5'>
                <Sparkles className='size-4.5 text-primary' />
              </div>
              <div className='space-y-1.5'>
                <span className='inline-flex items-center rounded-full border bg-background/70 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                  {safeT(
                    'homePage.auth.accountManagement.brokerHookBanner.badge',
                    'SellerNet Pro',
                  )}
                </span>
                <h3 className='text-base md:text-lg font-semibold leading-snug text-foreground'>
                  {safeT(
                    'homePage.auth.accountManagement.brokerHookBanner.title',
                    'Bật hồ sơ môi giới để tăng độ tin cậy và tiếp cận khách hàng nhanh hơn.',
                  )}
                </h3>
              </div>
            </div>

            <div className='mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='rounded-xl border bg-background/85 px-3.5 py-3.5 flex items-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md'>
                <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                  <Search className='size-4 text-primary' />
                </div>
                <span className='text-sm font-medium leading-snug'>
                  {safeT(
                    'homePage.auth.accountManagement.brokerHookBanner.items.featuredSearch',
                    'Nổi bật trên trang tìm kiếm',
                  )}
                </span>
              </div>
              <div className='rounded-xl border bg-background/85 px-3.5 py-3.5 flex items-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md'>
                <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                  <Gift className='size-4 text-primary' />
                </div>
                <span className='text-sm font-medium leading-snug'>
                  {safeT(
                    'homePage.auth.accountManagement.brokerHookBanner.items.joinFree',
                    'Tham gia miễn phí',
                  )}
                </span>
              </div>
              <div className='rounded-xl border bg-background/85 px-3.5 py-3.5 flex items-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md'>
                <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                  <BadgeCheck className='size-4 text-primary' />
                </div>
                <span className='text-sm font-medium leading-snug'>
                  {safeT(
                    'homePage.auth.accountManagement.brokerHookBanner.items.credibilityBoost',
                    'Tăng độ uy tín với hồ sơ xác thực',
                  )}
                </span>
              </div>
            </div>
          </div>

          <BrokerVerificationForm
            isPersonalInfoComplete={isPersonalInfoComplete}
            onRequirePersonalInfo={handleRequirePersonalInfo}
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
