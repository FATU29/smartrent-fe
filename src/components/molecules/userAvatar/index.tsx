import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { getUserAvatar, getUserFullName, getUserInitials } from '@/utils/user'
import { UserApi } from '@/api/types'

interface UserAvatarProps {
  user: UserApi
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
}

/**
 * Component hiển thị avatar của user với default fallback
 * Nếu không có avatarUrl thì sẽ hiển thị default avatar
 * Fallback hiển thị initials của user
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className,
}) => {
  const fullName = getUserFullName(user.firstName, user.lastName)
  const avatarUrl = getUserAvatar(user.avatarUrl)
  const initials = getUserInitials(user.firstName, user.lastName)

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={avatarUrl} alt={fullName} />
      <AvatarFallback className='bg-primary text-primary-foreground font-semibold'>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar
