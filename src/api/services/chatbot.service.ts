import { fetchEventSource } from '@microsoft/fetch-event-source'

import { ENV } from '@/constants'
import { cookieManager } from '@/utils/cookies'
import type {
  ChatRequest,
  ChatStreamHandlers,
  ChatStreamStatusPayload,
  ChatStreamTextPayload,
  ChatStreamListingsPayload,
  ChatStreamDonePayload,
  ChatStreamErrorPayload,
} from '@/api/types/ai.type'

const CHAT_STREAM_PATH = 'api/v1/chat/stream'

class StreamFatalError extends Error {
  name = 'StreamFatalError'
}

function getStreamUrl(): string {
  const base = ENV.URL_API_AI.endsWith('/')
    ? ENV.URL_API_AI
    : `${ENV.URL_API_AI}/`
  return `${base}${CHAT_STREAM_PATH}`
}

function getAuthToken(): string | null {
  return cookieManager.getAuthTokens()?.accessToken ?? null
}

export async function streamChat(
  request: ChatRequest & { user_id?: string | null },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const body = {
    ...request,
    auth_token: getAuthToken(),
  }

  await fetchEventSource(getStreamUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
    openWhenHidden: true,

    async onopen(response) {
      const contentType = response.headers.get('content-type') ?? ''
      if (response.ok && contentType.includes('text/event-stream')) return
      const errBody = await response.text().catch(() => '')
      throw new StreamFatalError(
        `HTTP ${response.status}${errBody ? `: ${errBody}` : ''}`,
      )
    },

    onmessage(ev) {
      if (!ev.data) return

      let data: unknown
      try {
        data = JSON.parse(ev.data)
      } catch {
        return
      }

      switch (ev.event) {
        case 'status':
          handlers.onStatus?.(data as ChatStreamStatusPayload)
          return
        case 'text':
          handlers.onTextDelta?.((data as ChatStreamTextPayload).delta)
          return
        case 'listings':
          handlers.onListings?.(data as ChatStreamListingsPayload)
          return
        case 'done':
          handlers.onDone?.(data as ChatStreamDonePayload)
          return
        case 'error': {
          const message = (data as ChatStreamErrorPayload).message
          handlers.onError?.(message)
          throw new StreamFatalError(message)
        }
      }
    },

    onerror(err) {
      const message =
        err instanceof Error ? err.message : 'Stream connection error'
      handlers.onError?.(message)
      throw err
    },
  })
}
