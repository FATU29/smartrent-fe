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

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      reconnectDelay: 5000,

      // Re-read the token on EVERY (re)connect instead of snapshotting it once.
      // The access token is short-lived and rotated by the axios refresh flow;
      // capturing it a single time meant that after it expired the STOMP
      // reconnect kept resending a stale/empty Authorization header, so the
      // server rejected every attempt ("missing bearer token") in a 5s loop and
      // realtime notifications silently died. Reading it here lets the next
      // reconnect pick up the refreshed token and recover on its own.
      beforeConnect: () => {
        const token = getAccessToken()
        client.connectHeaders = token
          ? { Authorization: `Bearer ${token}` }
          : {}
      },

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
        console.error(
          '[Notification WS] STOMP error:',
          frame.headers['message'],
        )
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
