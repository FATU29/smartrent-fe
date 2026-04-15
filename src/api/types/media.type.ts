export type MediaType = 'IMAGE' | 'VIDEO'
// UPLOAD = our R2 flow; YOUTUBE/TIKTOK/EXTERNAL come from saveExternal endpoint
export type MediaSourceType = 'UPLOAD' | 'YOUTUBE' | 'TIKTOK' | 'EXTERNAL'
export type MediaStatus = 'PENDING' | 'ACTIVE' | 'ARCHIVED' | 'DELETED'
export type MediaPurpose = 'LISTING' | 'AVATAR' | 'BROKER_DOCUMENT'

export interface MediaItem {
  mediaId: number
  listingId: number | null
  userId: string
  mediaType: MediaType
  sourceType: MediaSourceType
  status: MediaStatus
  url: string
  thumbnailUrl: string | null
  title: string | null
  description: string | null
  altText: string | null
  isPrimary: boolean
  sortOrder: number
  fileSize: number | null
  mimeType: string | null
  originalFilename: string | null
  durationSeconds: number | null
  uploadConfirmed: boolean
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
