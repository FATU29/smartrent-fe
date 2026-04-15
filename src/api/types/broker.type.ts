export type BrokerVerificationStatus =
  | 'NONE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export interface BrokerStatusResponse {
  userId: string
  isBroker: boolean
  brokerVerificationStatus: BrokerVerificationStatus
  brokerRegisteredAt?: string | null
  brokerVerifiedAt?: string | null
  brokerRejectionReason?: string | null
  brokerVerificationSource?: string | null
  cccdFrontUrl?: string | null
  cccdBackUrl?: string | null
  certUrl?: string | null
  // Backward compatibility with older backend payloads
  certFrontUrl?: string | null
}

export interface BrokerRegisterRequest {
  cccdFrontMediaId: number
  cccdBackMediaId: number
  certMediaId: number
}
