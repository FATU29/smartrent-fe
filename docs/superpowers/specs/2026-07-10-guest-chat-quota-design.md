# Guest Chat Quota — allow N anonymous messages before requiring login

- **Date:** 2026-07-10
- **Status:** Approved (design), pending implementation plan
- **Repos touched:** `smartrent-fe` (primary), `smartrent-backend` (narrow security change)
- **Repos verified, no change:** `smartrent-ai`
- **Depends on:** PR #397 (`fix/ai-chat-session-account-leak`) — extends
  `clearChatSessionStorage()` and the identity-reset effect it introduced.

## 1. Problem

Today an unauthenticated visitor cannot use the AI chatbot at all. The
frontend short-circuits every guest message in
`useChatLogic.sendMessage` (`src/hooks/useChatAi/useChatLogic.ts:146`) and
returns a "please login" bot bubble without ever calling the API.

We want guests to **try** the assistant: a guest may send **5 messages**;
after that the input is gated behind login.

## 2. Goals / Non-goals

**Goals**

- A guest can send up to 5 messages and receive real AI answers.
- On the 6th attempt the input is blocked and an inline login CTA is shown.
- Logging in (or out) resets the guest allowance and clears guest chat, in
  step with the session-reset behaviour from PR #397.

**Non-goals**

- Hardened, un-bypassable server-side per-guest quota. The gate is a
  frontend UX/conversion control; abuse/cost is bounded by the existing
  backend per-IP rate limiter (`ChatRateLimitService`).
- Changing the authenticated user experience (still unlimited, still
  personalised, still per-user rate-limited).
- Enabling the non-stream fallback endpoint for guests.

## 3. Locked decisions

| Decision            | Value                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Limit N             | **5** guest **user** messages                                                                                   |
| Enforcement         | **Frontend-only** soft gate; backend IP rate-limit is the abuse backstop                                        |
| Counter persistence | **`sessionStorage`** (per browser tab)                                                                          |
| At limit            | **Disable the input** + show an inline bot CTA message with a **"Đăng nhập"** button that opens the auth dialog |

## 4. Architecture overview

```
Guest sends message
  └─ useChatLogic.sendMessage
       ├─ if !isAuthenticated:
       │     ├─ limitReached? → add login-CTA message, stop
       │     └─ else → increment guest counter, continue (user_id = null)
       └─ streamChat → POST /v1/ai/chat/stream (no Bearer)
            └─ [BE] SecurityConfig: optional-auth POST → anon allowed,
                     IP rate-limit, no user_id injected
                 └─ [AI] require_internal_key (proxy auth) → user_id=None OK
                      └─ auth-only tools return "please login" hints, no crash
```

## 5. Frontend design (`smartrent-fe`)

### 5.1 New hook — `useGuestChatQuota`

`src/hooks/useChatAi/useGuestChatQuota.ts`

- Constant `GUEST_MESSAGE_LIMIT = 5`.
- `sessionStorage` key `smart-rent-ai-guest-msg-count`.
- Signature: `useGuestChatQuota(isAuthenticated: boolean)`.
- State `count`, seeded once from `sessionStorage` (lazy `useState`
  initialiser).
- Returns `{ count, limitReached, increment }` where
  `limitReached = !isAuthenticated && count >= GUEST_MESSAGE_LIMIT`.
- `increment()` → `count + 1`, persisted to `sessionStorage`.
- **Reset effect:** track previous `isAuthenticated` in a ref; when the value
  changes (login _or_ logout edge) reset `count` to 0 and clear storage.
  - The subtle owner-tag guard used for chat _history_ is **not** needed for
    the counter: the counter is only meaningful for guests, and a stale
    authenticated count is never read. A genuine guest reload produces no
    auth edge, so its count is preserved; a logged-in reload's
    `false→true` hydration edge merely resets an unused counter.
- Export `clearGuestQuotaStorage()` so auth handlers can wipe the counter
  even when the widget is unmounted (mirrors `clearChatSessionStorage`).

### 5.2 `useChatLogic.sendMessage`

Replace the current guest short-circuit
(`src/hooks/useChatAi/useChatLogic.ts:146-156`):

```ts
if (!isAuthenticated) {
  if (guestQuota.limitReached) return // input is already disabled; no-op guard
  guestQuota.increment() // consume one guest turn, then fall through
}
// ... existing streaming path; user_id already sent as `user?.userId ?? null`
```

- The counter is consumed at **dispatch** time (one increment per guest
  user message). A failed/aborted stream still consumes the turn — accepted
  as a simplification; revisit only if it proves annoying in testing.
- Expose `guestLimitReached` from the hook for the input-disable wiring.

### 5.3 Login CTA message

- Extend `TChatMessage` with an optional `action?: 'login'` field.
- CTA message: `{ id: 'guest-limit-cta', content: t('guestLimitReached'),
sender: 'bot', action: 'login' }`. The stable id makes `addMessage`
  dedupe it (idempotent).
- **When shown:** an effect in `useChatLogic` adds the CTA once when
  `guestLimitReached && !isLoading` — i.e. _after_ the 5th answer finishes
  streaming, not mid-stream.
- `AiChatBubble` (`src/components/molecules/aiChatBubble/index.tsx`): when
  `message.action === 'login'`, render a "Đăng nhập" button that calls
  `useAuthDialog().openAuth('login')`.

### 5.4 Input disable

- Thread `guestLimitReached` from `useChatLogic` → `AiChatWidget` →
  `AiChatInterface` → `AiChatInput`.
- `AiChatInput` gains a `disabled?: boolean` prop and a distinct disabled
  placeholder ("Đăng nhập để tiếp tục chat"). Effective disabled state =
  `isLoading || disabled`.

### 5.5 i18n

Add to **both** `messages/en.json` and `messages/vi.json` under `aiChat`:

- `guestLimitReached` — CTA bubble text.
- `loginToContinue` — button label + disabled-input placeholder.

### 5.6 Interaction with PR #397

- On login/logout the chat session already resets to the welcome message
  (identity-reset effect in `useChatSession`). We add the guest counter to
  the same lifecycle: `clearChatSessionStorage()` also calls
  `clearGuestQuotaStorage()`, and `useGuestChatQuota`'s own edge effect
  resets the in-memory count. Net effect: after login the guest's history
  _and_ allowance are gone and the CTA disappears.

## 6. Backend design (`smartrent-backend`)

The controller already handles anonymous callers: `chatStream`
(`ChatController.java:161-178`) derives identity from the JWT when present,
else the client IP, rate-limits per identity, and only injects
`user_id`/`auth_token` when authenticated.

The only blocker is Spring Security. `/v1/ai/chat/stream` is **not** in the
public POST allowlist of the base `application.yml` (only in
`application-local.yaml`), so anonymous requests get 401 in dev/prod.

**Pitfall:** simply adding it to the public POST allowlist is wrong. The
`bearerTokenResolver` (`SecurityConfig.java:122-129`) returns `null` (skips
JWT entirely) for public POST endpoints — which would make **authenticated**
users be treated as anonymous, losing personalisation and per-user
rate-limiting.

**Fix — optional-auth for POST** (mirror the existing GET mechanism):

1. `application.yml`: add **`"/v1/ai/chat/stream"`** to
   `authorize-ignored.methods.post` (narrow — do _not_ open `/v1/ai/**`).
2. `SecurityConfig.java`: add
   `OPTIONAL_AUTH_POST_PATTERNS = { "/v1/ai/chat/stream" }` and make
   `isOptionalAuthPath` also match POST. This excludes the endpoint from the
   "skip JWT" branch so a present Bearer token is still processed, while the
   allowlist entry lets anonymous callers through `.authenticated()`.

Result: anon → allowed, no token, IP rate-limit; authed → token processed,
`user_id` injected, per-user rate-limit. Unchanged for everyone else.

The non-stream `/v1/ai/chat` stays authenticated-only (it has no IP
rate-limit), so guests use the streaming path only. The FE default is
streaming (`ENV.CHAT_STREAMING_ENABLED`), so this is sufficient.

## 7. AI service (`smartrent-ai`) — verified, no change

Confirmed guest-safe end to end:

- DTO `user_id: Optional[str] = None` (`app/dto/chat.py:25`).
- Endpoints guarded by `require_internal_key` (`app/api/v1/chat.py:95`) —
  proxy→AI auth, independent of the user JWT.
- `ToolContext` accepts `None` for both fields (`app/agent/tool_context.py`).
- All 8 auth-requiring tools guard `if not token: return {status:error, "…chưa
đăng nhập…"}` (save_listing, get_user_info, get_recommendations,
  notifications_inbox, report_listing, update_listing_price,
  bulk_save_listings, my_listings_status) — no crash for guests.
- Public tools (search_listings, get_listing_detail, compare_listings) need
  no auth; the core guest use-case works.
- Suggestions adapt via `build_suggestions(..., bool(auth_token))`
  (`app/agent/orchestrator.py:859`).

Action: **smoke-test once** before the demo; no code change.

## 8. Edge cases

- Guest hits 5, reloads: `count=5` persists (sessionStorage) → still gated.
- Guest opens a new tab / clears storage: allowance resets. Accepted
  (frontend-only); backend IP rate-limit remains the abuse backstop.
- Guest reaches limit then logs in: session + counter reset, CTA gone,
  starts fresh as an authenticated user.
- Stream error on a guest turn: the turn is still counted (simplification).
- 5th answer still streaming: CTA deferred until `!isLoading`; input already
  disabled by `isLoading`.

## 9. Risks & mitigations (defense framing)

| Risk                                       | Severity           | Mitigation / framing                                                                                            |
| ------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| AI service rejects `user_id=null`          | 🟢 (verified safe) | Smoke-test before demo                                                                                          |
| Guest bypasses FE gate                     | 🟡                 | "FE gate = conversion UX; BE per-IP rate-limit = abuse control." Know the configured bucket size.               |
| Anonymous access to AI endpoint (cost/DoS) | 🟢                 | Narrow optional-auth (only `/v1/ai/chat/stream`); IP rate-limit; N=5 soft cap. A deliberate, defensible choice. |

## 10. Testing

- **`useGuestChatQuota` (vitest):** counts to 5 → `limitReached`; resets on
  login and logout edges; preserves count on a guest "reload" (no edge).
- **`useChatLogic` (vitest):** guest under limit dispatches (stream mock
  called); guest at limit does not dispatch and the CTA message is added;
  authenticated user is never gated.
- **Backend (JUnit):** `isOptionalAuthPath` returns true for POST
  `/v1/ai/chat/stream`; anonymous stream request is not 401; authenticated
  request still injects `user_id`.
- Gates: `npm run lint`, `npm run typecheck`, `npm run i18n:check`,
  `npm run test` (FE); backend `mvn test` for the security change.

## 11. Rollout / verification

1. Ship FE + BE changes on a branch off `origin/main` (after PR #397 is
   merged, so `clearChatSessionStorage` exists on main; otherwise rebase).
2. Deploy backend security change; verify anon `POST /v1/ai/chat/stream`
   returns `200` and an authed request still personalises.
3. Manual e2e: guest sends 5 → answers stream → 6th blocked with CTA →
   click "Đăng nhập" → login → chat resets, unlimited.

## 12. Open follow-ups (out of scope)

- Optional hardened backend per-IP guest quota (Redis) if a security-heavy
  review later demands it. Not built now by decision.
