import { useEffect, useRef, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { ENV } from '@/constants'
import type { NotificationItem } from '@/api/types/notification.type'

/**
 * WebSocket hook for realtime notification push via STOMP/SockJS.
 * Subscribes to /topic/notifications/{userId} and fires onNotification callback.
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

      onConnect: () => {
        console.log('[Notification WS] Connected')

        client.subscribe(`/topic/notifications/${userId}`, (message) => {
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
