import { useEffect, useRef, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { ENV } from '@/constants'
import { getAccessToken } from '@/utils/cookies'
import type { NotificationItem } from '@/api/types/notification.type'

/**
 * WebSocket hook for realtime notification push via STOMP/SockJS.
 * Subscribes to the private /user/queue/notifications destination (the server
 * routes to this session by its authenticated STOMP Principal) and fires the
 * onNotification callback.
 */
export function useNotificationWebSocket(
  userId: string | undefined,
  onNotification: (notification: NotificationItem) => void,
) {
  const clientRef = useRef<Client | null>(null)
  const callbackRef = useRef(onNotification)

  // Keep callback ref up-to-date without re-subscribing
  useEffect(() => {
    callbackRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    if (!userId) return

    const wsBaseUrl = ENV.URL_API_BASE.replace(/\/$/, '')

    const token = getAccessToken()

    // Without a token the CONNECT frame is guaranteed to be rejected, and
    // reconnectDelay would then retry every 5s forever with the same empty
    // header. Skip connecting until a token is actually available.
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[Notification WS] Connected')

        // Session-private user-destination. The backend routes here via
        // convertAndSendToUser based on the STOMP Principal it set from the JWT in
        // connectHeaders above, so a client only ever receives its OWN notifications
        // (no guessable public topic → no cross-user notification leak).
        client.subscribe('/user/queue/notifications', (message) => {
          try {
            const notification = JSON.parse(message.body) as NotificationItem
            callbackRef.current(notification)
          } catch (err) {
            console.error('[Notification WS] Parse error:', err)
          }
        })
      },

      onStompError: (frame) => {
        const message = frame.headers['message']
        console.error('[Notification WS] STOMP error:', message)

        // Auth errors won't resolve by retrying with the same stale token,
        // so stop the built-in reconnect loop instead of retrying forever.
        if (message && /bearer|token|auth/i.test(message)) {
          client.deactivate()
        }
      },

      onDisconnect: () => {
        console.log('[Notification WS] Disconnected')
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [userId])

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate()
    clientRef.current = null
  }, [])

  return { disconnect }
}
