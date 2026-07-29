/**
 * Contact Reveal Service
 * Fire-and-forget audit of contact reveals. Every time an authenticated user
 * reveals a seller's contact (phone / email / zalo) we POST to the backend so
 * the access is tracked. Tracking must never disrupt the contact UX, so this
 * always resolves and never throws.
 * @module api/services/contactReveal
 */

import { apiRequest } from '@/configs/axios/instance'

export type ContactRevealChannel = 'PHONE' | 'EMAIL' | 'ZALO'

export class ContactRevealService {
  static async logReveal(
    sellerUserId: string | undefined,
    channel: ContactRevealChannel,
    listingId?: number,
  ): Promise<void> {
    if (!sellerUserId) return

    // apiRequest already swallows errors and returns { success: false }; the
    // extra guard keeps a rejected promise from ever surfacing to the caller.
    try {
      await apiRequest({
        method: 'POST',
        url: `/v1/users/${sellerUserId}/reveal-contact`,
        data: { channel, listingId },
      })
    } catch {
      // no-op: reveal logging is best-effort
    }
  }
}
