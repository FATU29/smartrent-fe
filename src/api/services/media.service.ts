import { apiRequest } from '@/configs/axios/instance'
import type { AxiosProgressEvent } from 'axios'
import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  ConfirmUploadRequest,
  CreateUploadUrlRequest,
  CreateUploadUrlResponse,
  MediaItem,
  SaveExternalMediaRequest,
  UploadMediaRequest,
} from '@/api/types/media.type'

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
    mediaId: string | number,
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

  static async getById(
    mediaId: string | number,
  ): Promise<ApiResponse<MediaItem>> {
    const url = PATHS.MEDIA.BY_ID.replace(':mediaId', String(mediaId))
    return apiRequest<MediaItem>({ url, method: 'GET' })
  }

  static async delete(mediaId: string | number): Promise<ApiResponse<string>> {
    const url = PATHS.MEDIA.DELETE.replace(':mediaId', String(mediaId))
    return apiRequest<string>({ url, method: 'DELETE' })
  }

  static async getDownloadUrl(
    mediaId: string | number,
  ): Promise<ApiResponse<string>> {
    const url = PATHS.MEDIA.DOWNLOAD_URL.replace(':mediaId', String(mediaId))
    return apiRequest<string>({ url, method: 'GET' })
  }

  static async getMyMedia(): Promise<ApiResponse<MediaItem[]>> {
    return apiRequest<MediaItem[]>({ url: PATHS.MEDIA.MY_MEDIA, method: 'GET' })
  }

  static async getByListingId(
    listingId: string | number,
  ): Promise<ApiResponse<MediaItem[]>> {
    const url = PATHS.MEDIA.BY_LISTING.replace(':listingId', String(listingId))
    return apiRequest<MediaItem[]>({ url, method: 'GET' })
  }
}
