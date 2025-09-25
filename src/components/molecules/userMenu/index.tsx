import { NextPage } from 'next'
import Link from 'next/link'
import { SELLERNET_ROUTES } from '@/constants'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { Avatar } from '@/components/atoms/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { LogOut, User, Settings } from 'lucide-react'

const UserMenu: NextPage = () => {
  const { user, isAuthenticated } = useAuth()
  const { logoutUser } = useLogout()
  const t = useTranslations()

  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = async () => {
    await logoutUser()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <div className='flex items-center justify-center h-full w-full bg-primary text-primary-foreground text-sm font-medium'>
              {getInitials(user.firstName, user.lastName)}
            </div>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-1'>
            <Typography variant='p' className='text-sm font-medium'>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography
              variant='p'
              className='text-xs leading-none text-muted-foreground'
            >
              {user.email}
            </Typography>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={SELLERNET_ROUTES.ACCOUNT}>
            <User className='mr-2 h-4 w-4' />
            <span>{t('navigation.accountManagement')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className='mr-2 h-4 w-4' />
          <span>{t('homePage.auth.settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className='mr-2 h-4 w-4' />
          <span>{t('homePage.auth.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
