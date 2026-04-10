export type MediaType = 'IMAGE' | 'VIDEO'
export type MediaSourceType = 'UPLOAD' | 'EXTERNAL'
export type MediaStatus = 'PENDING' | 'ACTIVE' | 'DELETED'
export type MediaPurpose = 'LISTING' | 'AVATAR'

export interface MediaItem {
  mediaId: number
  listingId: number
  userId: string
  mediaType: MediaType
  sourceType: MediaSourceType
  status: MediaStatus
  url: string
  thumbnailUrl?: string
  title?: string
  description?: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
  fileSize: number
  mimeType?: string
  originalFilename?: string
  durationSeconds?: string
  uploadConfirmed?: boolean
  createdAt: string
  updatedAt: string
}

// Step 1: request upload URL
export interface CreateUploadUrlRequest {
  mediaType: MediaType
  purpose: MediaPurpose
  filename: string
  contentType: string
  fileSize: number
  listingId?: number
  title?: string
  description?: string
  altText?: string
  isPrimary?: boolean
  sortOrder?: number
}

export interface CreateUploadUrlResponse {
  mediaId: number
  uploadUrl: string
  expiresIn: number
  storageKey: string
  message?: string
}

// Step 2: client uploads file to uploadUrl

// Step 3: confirm upload
export interface ConfirmUploadRequest {
  checksum?: string
  contentType?: string
}

export interface UploadMediaRequest {
  // multipart/form-data
  file: File | Blob
  mediaType: MediaType
  listingId?: number
  title?: string
  description?: string
  altText?: string
  isPrimary?: boolean
  sortOrder?: number
}

export interface SaveExternalMediaRequest {
  url: string
  listingId?: number
  title?: string
  description?: string
  altText?: string
  isPrimary?: boolean
  sortOrder?: number
}
