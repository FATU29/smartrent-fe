import { PATHS } from '@/api/paths'
import type { ApiResponse } from '@/configs/axios/types'
import type {
  PurchaseMembershipRequest,
  PurchaseMembershipResponse,
  GetPackagesResponse,
  GetPackageByIdResponse,
  GetMyMembershipResponse,
  GetMembershipHistoryResponse,
  CancelMembershipResponse,
} from '@/api/types/memembership.type'
import { apiRequest } from '@/configs/axios/instance'
import { AxiosInstance } from 'axios'

export class MembershipService {
  static async purchaseMembership(
    request: PurchaseMembershipRequest,
    userId: string,
  ): Promise<ApiResponse<PurchaseMembershipResponse>> {
    const response = await apiRequest<PurchaseMembershipResponse>({
      method: 'POST',
      url: PATHS.MEMBERSHIP.PURCHASE,
      data: request,
      headers: {
        'user-id': userId,
      },
    })

    return response
  }

  static async getAllPackages(
    instance?: AxiosInstance,
  ): Promise<ApiResponse<GetPackagesResponse>> {
    const response = await apiRequest<GetPackagesResponse>(
      {
        method: 'GET',
        url: PATHS.MEMBERSHIP.PACKAGES,
      },
      instance,
    )

    return response
  }

  static async getPackageById(
    membershipId: number,
  ): Promise<ApiResponse<GetPackageByIdResponse>> {
    const url = PATHS.MEMBERSHIP.PACKAGE_BY_ID.replace(
      ':membershipId',
      membershipId.toString(),
    )

    const response = await apiRequest<GetPackageByIdResponse>({
      method: 'GET',
      url,
    })

    return response
  }

  static async getMyMembership(
    userId: string,
  ): Promise<ApiResponse<GetMyMembershipResponse>> {
    const response = await apiRequest<GetMyMembershipResponse>({
      method: 'GET',
      url: PATHS.MEMBERSHIP.MY_MEMBERSHIP,
      headers: {
        'user-id': userId,
      },
    })

    return response
  }

  static async getMembershipHistory(
    userId: string,
  ): Promise<ApiResponse<GetMembershipHistoryResponse>> {
    const response = await apiRequest<GetMembershipHistoryResponse>({
      method: 'GET',
      url: PATHS.MEMBERSHIP.HISTORY,
      headers: {
        'user-id': userId,
      },
    })

    return response
  }

  static async cancelMembership(
    userMembershipId: number,
    userId: string,
  ): Promise<ApiResponse<CancelMembershipResponse>> {
    const url = PATHS.MEMBERSHIP.CANCEL.replace(
      ':userMembershipId',
      userMembershipId.toString(),
    )

    const response = await apiRequest<CancelMembershipResponse>({
      method: 'DELETE',
      url,
      headers: {
        'user-id': userId,
      },
    })

    return response
  }
}

export const {
  purchaseMembership,
  getAllPackages,
  getPackageById,
  getMyMembership,
  getMembershipHistory,
  cancelMembership,
} = MembershipService
