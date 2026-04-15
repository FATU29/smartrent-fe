import axios, { type AxiosProgressEvent } from 'axios'
import { apiRequest } from '@/configs/axios/instance'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  ConfirmUploadRequest,
  CreateUploadUrlRequest,
  CreateUploadUrlResponse,
  MediaItem,
  MediaPurpose,
  MediaType,
  SaveExternalMediaRequest,
  UploadMediaRequest,
} from '@/api/types/media.type'

/**
 * Metadata required to upload a file via the R2 presigned URL flow.
 * `listingId` is required when `purpose === 'LISTING'` and forbidden when
 * `purpose === 'AVATAR'` or `purpose === 'BROKER_DOCUMENT'`
 * (BE will reject mismatches).
 */
export interface UploadViaPresignInput {
  file: File
  mediaType: MediaType
  purpose: MediaPurpose
  listingId?: number
  title?: string
  description?: string
  altText?: string
  isPrimary?: boolean
  sortOrder?: number
}

export interface UploadViaPresignOptions {
  onUploadProgress?: (e: AxiosProgressEvent) => void
  signal?: AbortSignal
}

export class MediaService {
  static async createUploadUrl(
    payload: CreateUploadUrlRequest,
  ): Promise<ApiResponse<CreateUploadUrlResponse>> {
    return apiRequest<CreateUploadUrlResponse>({
      url: PATHS.MEDIA.UPLOAD_URL,
      method: 'POST',
      data: payload,
    })
  }

  static async confirmUpload(
    mediaId: number,
    payload: ConfirmUploadRequest,
  ): Promise<ApiResponse<MediaItem>> {
    const url = PATHS.MEDIA.CONFIRM_UPLOAD.replace(':mediaId', String(mediaId))
    return apiRequest<MediaItem>({
      url,
      method: 'POST',
      data: payload,
    })
  }

  static async upload(
    payload: UploadMediaRequest,
    opts?: { onUploadProgress?: (e: AxiosProgressEvent) => void },
  ): Promise<ApiResponse<MediaItem>> {
    const form = new FormData()
    form.append('file', payload.file)
    form.append('mediaType', payload.mediaType)
    if (payload.listingId !== undefined)
      form.append('listingId', String(payload.listingId))
    if (payload.title) form.append('title', payload.title)
    if (payload.description) form.append('description', payload.description)
    if (payload.altText) form.append('altText', payload.altText)
    if (payload.isPrimary !== undefined)
      form.append('isPrimary', String(payload.isPrimary))
    if (payload.sortOrder !== undefined)
      form.append('sortOrder', String(payload.sortOrder))

    return apiRequest<MediaItem>({
      url: PATHS.MEDIA.UPLOAD,
      method: 'POST',
      data: form,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: opts?.onUploadProgress,
    })
  }

  static async saveExternal(
    payload: SaveExternalMediaRequest,
  ): Promise<ApiResponse<MediaItem>> {
    return apiRequest<MediaItem>({
      url: PATHS.MEDIA.EXTERNAL,
      method: 'POST',
      data: payload,
    })
  }

  static async getById(mediaId: number): Promise<ApiResponse<MediaItem>> {
    const url = PATHS.MEDIA.BY_ID.replace(':mediaId', String(mediaId))
    return apiRequest<MediaItem>({ url, method: 'GET' })
  }

  static async delete(mediaId: number): Promise<ApiResponse<string>> {
    const url = PATHS.MEDIA.DELETE.replace(':mediaId', String(mediaId))
    return apiRequest<string>({ url, method: 'DELETE' })
  }

  static async getDownloadUrl(mediaId: number): Promise<ApiResponse<string>> {
    const url = PATHS.MEDIA.DOWNLOAD_URL.replace(':mediaId', String(mediaId))
    return apiRequest<string>({ url, method: 'GET' })
  }

  static async getMyMedia(): Promise<ApiResponse<MediaItem[]>> {
    return apiRequest<MediaItem[]>({ url: PATHS.MEDIA.MY_MEDIA, method: 'GET' })
  }

  static async getByListingId(
    listingId: number,
  ): Promise<ApiResponse<MediaItem[]>> {
    const url = PATHS.MEDIA.BY_LISTING.replace(':listingId', String(listingId))
    return apiRequest<MediaItem[]>({ url, method: 'GET' })
  }

  /**
   * Upload a file directly to Cloudflare R2 via a presigned URL.
   *
   * Three steps:
   *   1. Ask BE for a presigned PUT URL (`createUploadUrl`).
   *   2. PUT the raw file bytes to R2 using a bare axios call so we don't
   *      attach the Bearer token, baseURL, or trigger response interceptors —
   *      R2 would otherwise reject the signature or our 401 handler would
   *      log the user out.
   *   3. Notify BE that the upload finished (`confirmUpload`), which marks
   *      the media record ACTIVE and returns the final MediaItem.
   *
   * Bypasses Vercel's 4.5MB serverless body limit since the file never
   * touches the backend.
   */
  static async uploadViaPresign(
    input: UploadViaPresignInput,
    opts?: UploadViaPresignOptions,
  ): Promise<ApiResponse<MediaItem>> {
    const { file, mediaType, purpose } = input

    // Step 1: request presigned URL
    const presignResponse = await MediaService.createUploadUrl({
      mediaType,
      purpose,
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
      listingId: input.listingId,
      title: input.title,
      description: input.description,
      altText: input.altText,
      isPrimary: input.isPrimary,
      sortOrder: input.sortOrder,
    })

    if (!presignResponse.success || !presignResponse.data) {
      throw new Error(presignResponse.message || 'Failed to obtain upload URL')
    }

    const { mediaId, uploadUrl } = presignResponse.data

    // Step 2: PUT file bytes directly to R2.
    // Use raw axios (NOT axiosClient) to avoid:
    //   - Bearer token header (R2 would reject signature)
    //   - baseURL prefix
    //   - response interceptor that triggers logout on 401
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: opts?.onUploadProgress,
      signal: opts?.signal,
      // Allow large files; axios defaults to 10MB content limit otherwise.
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    // Step 3: confirm upload — BE verifies via HeadObject and marks ACTIVE.
    return MediaService.confirmUpload(mediaId, { contentType: file.type })
  }
}
