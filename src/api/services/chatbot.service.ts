import { fetchEventSource } from '@microsoft/fetch-event-source'

import { ENV } from '@/constants'
import { cookieManager } from '@/utils/cookies'
import type {
  ChatRequest,
  ChatStreamHandlers,
  ChatStreamStatusPayload,
  ChatStreamTextPayload,
  ChatStreamListingsPayload,
  ChatStreamSuggestionsPayload,
  ChatStreamDonePayload,
  ChatStreamErrorPayload,
} from '@/api/types/ai.type'

const CHAT_STREAM_PATH = 'v1/ai/chat/stream'

class StreamFatalError extends Error {
  name = 'StreamFatalError'
}

function getStreamUrl(): string {
  // Chat streaming now goes through the backend proxy (authenticated +
  // rate-limited), not the AI service directly.
  const base = ENV.URL_API_BASE.endsWith('/')
    ? ENV.URL_API_BASE
    : `${ENV.URL_API_BASE}/`
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
  // Backend injects user_id + token from the JWT; send the token as a header
  // instead of an auth_token body field.
  const token = getAuthToken()

  await fetchEventSource(getStreamUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
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
        case 'suggestions':
          handlers.onSuggestions?.(data as ChatStreamSuggestionsPayload)
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
