export interface UserApi {
  userId: string
  phoneCode: string
  phoneNumber: string
  email: string
  password?: string
  firstName: string
  lastName: string
  idDocument: string
  taxNumber: string
  contactPhoneNumber: string
  contactPhoneVerified: boolean
  avatarUrl?: string
  avatarMediaId?: number
  isBroker?: boolean | null
  brokerVerificationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | null
  // True when an admin has blocked this user from posting new listings
  postingBlocked?: boolean
  postingBlockedReason?: string | null
}
