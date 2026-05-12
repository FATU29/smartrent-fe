# UI Review — Pre-defense audit

**Date**: 2026-05-12
**Branch**: `chore/ui-review-week1`
**Scope**: `smartrent-fe` — chatbot widget + non-chatbot pages
**Goal**: Identify UX gaps and polish opportunities before thesis defense
(2026-07-10). Companion to `smartrent-ai/docs/TOOL_REVIEW.md`.

## Severity legend

- 🔴 Visible regression or missing feature that hurts demo
- 🟡 UX gap worth addressing before defense
- 🟢 Polish / nice-to-have

---

## Part 1 — Chatbot widget

Files audited:

- `components/organisms/aiChatWidget/`
- `components/organisms/aiChatInterface/`
- `components/molecules/aiChatBubble/`
- `components/atoms/aiChatTypingIndicator/`
- `hooks/useChatAi/{useChatLogic,useChatScroll,useChatSession}.ts`
- `api/services/chatbot.service.ts`
- `api/types/ai.type.ts`

### Findings

- 🔴 **Stop-streaming button missing from UI**
  `useChatLogic.ts:435` defines `cancelStream` (abort the SSE) but the
  widget never surfaces a stop control. The user can't cancel a slow
  request — must wait or close the widget. Defense risk: advisor asks
  "what happens if response stalls?" and we have no answer.
  Fix: pass `cancelStream` from `useChatAi` → `aiChatInterface` → into
  `aiChatTypingIndicator` (replace the right side of the typing pill
  with a small × icon when `isTyping === true`).

- 🔴 **Zero-result fall-through unhandled in `onListings`**
  `useChatLogic.ts:261-270`: when the BE emits a `listings` event with
  `listings: []`, the handler still stamps the empty array onto the
  bot message. The system prompt teaches the LLM to retry-on-empty
  before reporting zero results, so in practice the text-side message
  ("Không tìm thấy…") is correct, but the FE has no UI affordance
  (no illustration, no CTA to broaden filters). Quick win: in
  `aiChatBubble`, when `listings === []` AND text contains a "không
  tìm thấy" sentinel, render a `SearchEmptyState` chip (illustration
  - "Mở rộng giá / Khu vực khác" suggestion buttons).

- 🟡 **Tool-call args displayed in plain text only**
  Sprint v2's FE PR #243 wired the BE-generated `summary` (e.g.
  "Đang tìm BĐS: quận 765 phòng/căn hộ giá 5-10tr..."). The status
  event also ships a structured `args` object that we currently
  ignore. ChatGPT/Claude pattern is an expandable tool-call bubble
  showing `args` as key/value rows. Defer to Tier 2 streaming polish
  (Phase 2 of THESIS_PLAN.md).

- 🟡 **No skeleton placeholder during tool execution**
  Between `tool_call` status and `listings` event there's a ~500ms-2s
  gap where the typing dots are the only feedback. Tier 2 polish:
  render 3 `<CardListingAIDetail>` skeletons that fade into real cards
  when the listings event arrives.

- 🟡 **Listings event still arrives as one bulk payload**
  BE collects all `_raw_listings` from tool results, dedupes, then
  emits a single `listings` event right before `done`. Cards pop in
  together rather than progressively. Tier 2 — needs BE coordination
  (emit per-card events from the orchestrator).

- 🟡 **Markdown re-parse on every text delta**
  `aiChatBubble` runs `ReactMarkdown` over the full accumulated
  content for every `text` event. Long answers (compare-listing
  tables) cause measurable jank near the end of streaming. Mitigation:
  debounce markdown render to 100ms while streaming, then full render
  on `done`.

- 🟡 **Auto-scroll fights layout shift on listings arrival**
  `useChatLogic.ts:222` writes `scrollTop = scrollHeight` on every
  delta + listing event. The sudden height jump when 5 listing cards
  inflate at once causes a visible scroll yank. Batch the scroll into
  a single rAF after the listings payload settles.

- 🟢 **Card consistency between chat and homepage**
  Chat card (`CardListingAIDetail` compact) and homepage listing card
  diverge in amenities badge layout. Not a defense blocker; align
  later.

- 🟢 **Mobile card width**
  Bot bubbles cap at `max-w-[90%]`; on landscape phones some listings
  push the boundary. No real overflow but tightening to `max-w-full`
  on `< md` is cleaner.

- 🟢 **Polish backlog**
  No copy-message button, no regenerate, no listing image carousel
  swipe. All out of defense scope.

---

## Part 2 — Non-chatbot pages

Files audited: page inventory in `pages/`, key templates in
`components/templates/`.

### Page inventory

**Renter / public:**

- `/` homepage, `/properties`, `/listing-detail/[id]`, `/compare`,
  `/saved-listings`, `/maps`, `/news`, `/news/[slug]`, `/following`,
  `/properties/seller/[userId]`

**Owner (`/seller/*`):**

- `/seller/dashboard`, `/seller/listings`, `/seller/customers`,
  `/seller/create-post`, `/seller/update-post/[id]`, `/seller/drafts`,
  `/seller/account` → redirect to `/sellernet/personal/edit`

**Broker (`/sellernet/*`):**

- `/sellernet/membership` (+ `/register`), `/sellernet/personal/edit`,
  `/sellernet/guides/*`

**Auth + errors:**

- `/auth/callback/google`, custom `404.tsx`

### Findings by area

**Owner pages**

- 🟢 **`/seller/dashboard` hiding behaviour overstated**
  Initial audit suggested entire sections collapsed on empty data. On
  re-reading `dashboardTemplate:226-276` and `:280-322`, only the
  stats summary cards (`DashboardPhoneClickStats`) hide; the section
  header + description + chart always render. The chart component
  presumably has its own loading/empty state. Minor fix opportunity:
  swap the conditional stats card for an always-rendered card with
  zeros so the visual frame is stable, but not a defense blocker.
  Skipping in this branch — verify in browser during Week 7 demo
  rehearsal before deciding.
- 🟡 **`/seller/listings` filters re-fetch without skeleton**
  `useListings` swaps `data` immediately when filters change, no
  loading state shown — feels frozen on slow networks. Add a soft
  skeleton overlay during refetch.
- 🟢 The earlier thesis note that `/seller/customers` is empty is
  **incorrect** — the template has full search/table/stats/pagination
  and a proper empty state. Strike from the worry list.

**Renter pages**

- 🟡 **`/listing-detail/[id]` has no "Ask AI about this listing" CTA**
  The page already loads price history + similar listings, so the
  data is there; an "AI evaluate this price" button that opens the
  chatbot pre-filled with the listing context would showcase the
  agent. Aligned with Phase 1 of THESIS_PLAN.md (the
  `evaluate_this_listing` tool we plan to add).
- 🟢 `/compare`, `/saved-listings`, `/news` all have polished empty
  states and loading skeletons. No action.

**Error states**

- 🟢 Custom 404 (`NotFoundTemplate`) is in place. 500 falls back to
  Next.js default — adding a friendly 500 page is low effort but
  unlikely to fire during a controlled demo. Defer.

### Cross-cutting

- 🟡 **Mobile sweep needed**
  ~122 templates use `sm:` breakpoints, only 11 use `md:hidden`
  / `hidden md:` for explicit mobile-only show/hide logic. Suggests
  several templates haven't been deliberately tested on phone width.
  Defense demo will likely be on a laptop, so this is medium-priority
  — schedule a 1-hour smoke pass during Week 7 demo prep.
- 🟢 **Design system compliance**: Typography variants are widely
  adopted, no hex-color escapes, semantic spacing tokens used at
  surface level. `eslint-disable no-inline-heading-sizes` only on
  legitimate stat-counter overrides. Clean.

---

## Fixes applied in this branch

None — this branch is documentation-only. Initial plan was to apply a
dashboard empty-state tweak, but verification of
`dashboardTemplate.tsx:226-276` showed the audit had overstated the
issue (only the small stats card hides, not the whole section).
Decisions about which findings to fix are best made after the demo
rehearsal in Week 7, when the actual visual gaps become obvious.

The audit doc itself is the deliverable: it gives the reviewer a
priority-ranked list so we can spend follow-up sprints on real wins
(stop button, zero-result chip, skeleton placeholders) rather than
speculative changes.

## Deferred — Phase 2 (Tier 2 streaming polish, weeks 4-5)

- Stop-streaming button wired through to typing indicator
- Zero-result `SearchEmptyState` chip with broaden-filters CTAs
- Tool-call args rendered as expandable bubble
- Skeleton-card placeholders during tool execution
- Progressive listing render (per-card events from BE)
- Markdown render debounce during streaming
- rAF-batched auto-scroll on listing arrival

## Deferred — Phase 1 follow-up

- "Ask AI about this listing" CTA on `/listing-detail/[id]`
  (depends on the `evaluate_this_listing` tool being added; both ship
  together)

## Out of defense scope

- Card layout consistency (chat vs homepage), mobile-only mobile
  affordances on listing cards, copy-message / regenerate-response,
  listing image carousel swipe, custom 500 page.
