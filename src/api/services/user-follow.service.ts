/**
 * User Follow Service
 * Wraps /v1/users/{userId}/follow{,-status,ers,ing} endpoints.
 * @module api/services/user-follow
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import { FollowStatusResponse, FollowedUsersPageResponse } from '../types'

const buildUrl = (template: string, userId: string) =>
  template.replace(':userId', encodeURIComponent(userId))

export class UserFollowService {
  /** Idempotent on the server. */
  static async follow(
    userId: string,
  ): Promise<ApiResponse<FollowStatusResponse>> {
    return apiRequest<FollowStatusResponse>({
      method: 'POST',
      url: buildUrl(PATHS.USER_FOLLOW.FOLLOW, userId),
    })
  }

  /** Idempotent on the server. */
  static async unfollow(
    userId: string,
  ): Promise<ApiResponse<FollowStatusResponse>> {
    return apiRequest<FollowStatusResponse>({
      method: 'DELETE',
      url: buildUrl(PATHS.USER_FOLLOW.UNFOLLOW, userId),
    })
  }

  /**
   * Public endpoint. When called anonymously the server still returns a valid
   * response with `isFollowing=false`, so callers can use this regardless of auth.
   */
  static async getStatus(
    userId: string,
  ): Promise<ApiResponse<FollowStatusResponse>> {
    return apiRequest<FollowStatusResponse>({
      method: 'GET',
      url: buildUrl(PATHS.USER_FOLLOW.STATUS, userId),
    })
  }

  static async getFollowers(
    userId: string,
    page = 0,
    size = 20,
  ): Promise<ApiResponse<FollowedUsersPageResponse>> {
    return apiRequest<FollowedUsersPageResponse>({
      method: 'GET',
      url: buildUrl(PATHS.USER_FOLLOW.FOLLOWERS, userId),
      params: { page, size },
    })
  }

  static async getFollowing(
    userId: string,
    page = 0,
    size = 20,
  ): Promise<ApiResponse<FollowedUsersPageResponse>> {
    return apiRequest<FollowedUsersPageResponse>({
      method: 'GET',
      url: buildUrl(PATHS.USER_FOLLOW.FOLLOWING, userId),
      params: { page, size },
    })
  }
}
