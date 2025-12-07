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
}
