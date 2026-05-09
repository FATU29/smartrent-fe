/**
 * User Follow API types — directed follow graph between users.
 * Backend: see /v1/users/{userId}/follow{,-status,ers,ing}.
 */

export interface FollowStatusResponse {
  userId: string
  isFollowing: boolean
  followerCount: number
}

export interface FollowedUser {
  userId: string
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  isBroker?: boolean | null
  brokerVerificationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | null
  followedAt?: string | null
}

export interface FollowedUsersPageResponse {
  content: FollowedUser[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first?: boolean
  last?: boolean
  empty?: boolean
}

export const USER_FOLLOW_QUERY_KEYS = {
  all: ['user-follow'] as const,
  status: (userId: string) =>
    [...USER_FOLLOW_QUERY_KEYS.all, 'status', userId] as const,
  followers: (userId: string, page: number, size: number) =>
    [...USER_FOLLOW_QUERY_KEYS.all, 'followers', userId, page, size] as const,
  following: (userId: string, page: number, size: number) =>
    [...USER_FOLLOW_QUERY_KEYS.all, 'following', userId, page, size] as const,
}
