# SmartRent Frontend

The web client for **SmartRent** — a Vietnamese rental marketplace where tenants discover listings and brokers/owners manage their inventory. Built with Next.js (Pages Router), React 19 and TypeScript, the app powers the public storefront, the broker workspace (SellerNet), an AI chat assistant, news, and the membership/payment flows.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Project Structure](#project-structure)
5. [Architecture](#architecture)
6. [Routing & Surfaces](#routing--surfaces)
7. [Data Layer](#data-layer)
8. [Internationalization](#internationalization)
9. [Design System](#design-system)
10. [Conventions](#conventions)
11. [Quality Gates](#quality-gates)
12. [Documentation](#documentation)

---

## Tech Stack

| Area               | Choice                                                       |
| ------------------ | ------------------------------------------------------------ |
| Framework          | Next.js 15 (Pages Router) + React 19 + TypeScript            |
| Styling            | Tailwind CSS v4 + shadcn/ui (`new-york` style) + SCSS resets |
| Component baseline | Radix UI primitives wrapped through shadcn atoms             |
| State / data       | TanStack Query v5, Zustand stores, React Context             |
| Forms / validation | react-hook-form + zod (preferred) and yup (legacy)           |
| i18n               | next-intl (Vietnamese default, English on demand)            |
| HTTP               | axios (configured in `src/configs/axios`)                    |
| Realtime           | `@stomp/stompjs` + `sockjs-client` for notifications/push    |
| Maps               | `@vis.gl/react-google-maps` and `google-map-react`           |
| Charts             | Recharts (loaded dynamically in the dashboard)               |
| Animation          | Motion (Framer Motion successor)                             |
| Icons              | `lucide-react` only — do not mix in other icon libraries     |
| Package manager    | npm (required — do not switch to pnpm/yarn)                  |
| Tests              | Vitest + Testing Library + jsdom                             |
| Lint / format      | ESLint 9, Prettier, Husky + lint-staged, SonarQube           |

---

## Getting Started

### Prerequisites

- Node.js (use the version pinned by `nvm use`)
- npm
- A populated `.env.local` (see [Environment](#environment) below)

### Install & run

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # development server on http://localhost:3000
```

`npm run dev` uses Turbopack by default. If a dependency misbehaves under Turbopack, fall back to webpack with `npm run dev:webpack`.

### Environment

The app reads the following `NEXT_PUBLIC_*` variables (see `src/constants/env`):

| Variable                        | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_URL_API_BASE`      | Base URL of the SmartRent backend API                            |
| `NEXT_PUBLIC_URL_API_AI`        | Base URL of the AI/chat service                                  |
| `NEXT_PUBLIC_SITE_URL`          | Canonical site URL used in SEO and OG tags                       |
| `NEXT_PUBLIC_IMAGE_REMOTE_HOST` | Extra hostname allowed by `next/image` `remotePatterns`          |
| `NEXT_PUBLIC_DEPLOY_ENV`        | `development` \| `staging` \| `production` (gates devtools etc.) |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY`   | Google Maps JavaScript API key                                   |

Variables prefixed with `NEXT_PUBLIC_` are shipped to the browser — never put secrets there.

---

## Available Scripts

```bash
# Development
npm run dev            # Next.js dev server (Turbopack)
npm run dev:webpack    # Same, but with the legacy webpack compiler
npm run build          # Production build
npm run build:check    # Production build without lint
npm run start          # Serve the production build

# Quality
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run i18n:check     # Verifies en.json / vi.json key parity
npm run format         # Prettier write
npm run format:check   # Prettier check
npm run pre-commit     # typecheck + i18n:check (gate before committing)

# Tests
npm run test           # Vitest watch mode
npm run test:run       # Vitest single run
```

Husky + lint-staged run ESLint and Prettier on staged files automatically on commit.

---

## Project Structure

```
smartrent-fe/
├── public/                       # Static assets (compress images before adding)
│   ├── images/
│   └── svg/
├── scripts/
│   └── check-i18n-keys.js        # Validates message catalog parity
├── src/
│   ├── api/
│   │   ├── paths.ts              # Centralized API URL definitions
│   │   ├── services/             # Per-domain service modules (axios calls)
│   │   └── types/                # Request/response types (the only place `any` is allowed)
│   ├── components/               # Atomic Design tree
│   │   ├── atoms/                # shadcn primitives (button, input, dialog, …)
│   │   ├── molecules/            # Composed pieces (forms fields, cards, filters)
│   │   ├── organisms/            # Feature blocks (auth dialog, listing card, AI chat)
│   │   ├── templates/            # Page-level layouts (one per route family)
│   │   ├── layouts/              # Persistent shells (homepage, seller)
│   │   └── utility/              # Cross-cutting helpers (route gates, etc.)
│   ├── configs/                  # Library setup (axios instance, query client, …)
│   ├── constants/                # App constants, env getters, regex
│   ├── contexts/                 # React contexts (auth, theme, language, post drafts)
│   ├── hooks/                    # Custom hooks (data, UI, browser APIs)
│   ├── lib/                      # Small utility modules used across the app
│   ├── messages/                 # next-intl catalogs — `en.json`, `vi.json`
│   ├── middleware.ts             # Auth gate + public-route allowlist
│   ├── mock/                     # Mock data for tests / Storybook-style fixtures
│   ├── pages/                    # Next.js Pages Router (thin shells over templates)
│   ├── store/                    # Zustand stores (auth session cache, compare list)
│   ├── styles/                   # globals.css, reset.scss, route-scoped CSS
│   ├── test/                     # Vitest setup
│   ├── theme/                    # Font definitions and theme tokens
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # Pure helpers (i18n, formatting, storage, deep links)
├── DESIGN_SYSTEM.md              # Tokens, typography, spacing, color usage
├── components.json               # shadcn configuration
├── next.config.ts                # next/image hosts, console stripping, package import opts
├── tailwind.config.js            # Theme tokens, content globs
├── eslint.config.mjs             # Includes the no-inline-heading-sizes rule
├── sonar-project.properties      # SonarQube config (allowlist of ignored rules)
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Architecture

The codebase combines four overlapping patterns. They are not aspirational — the linter, Sonar, and pre-commit hooks enforce them.

### 1. Atomic Design

Components are layered, and lower layers never import from higher ones:

```
atoms → molecules → organisms → templates → pages
```

- **Atoms** (`components/atoms/`) — shadcn-style primitives: `button.tsx`, `input.tsx`, `form.tsx`, `dialog.tsx`, `typography.tsx`. Built with `cva` variants, `cn()` for class merging, `forwardRef`, and an explicit `displayName`.
- **Molecules** — small composed units: form fields, cards, filter chips, search inputs.
- **Organisms** — feature blocks that know about data and business rules: `authDialog`, `aiChatWidget`, `listing-card`, `navigation`, `appHeader`, `footer`.
- **Templates** — full page layouts under `components/templates/<name>Template/`. Each template owns the data composition and section ordering for one route family.
- **Pages** (`src/pages/*.tsx`) — thin shells that wire data into a template, attach a layout, and render `<SeoHead>`.

### 2. Feature-based services & hooks

`src/api/services/*.service.ts` and `src/hooks/use*` are organized by domain (listing, broker, payment, news, membership, AI chat, notifications, push, etc.) so each feature can evolve independently.

### 3. Separation of concerns

- **Business logic** — hooks and contexts
- **Data fetching** — `src/api/services` (axios) consumed via TanStack Query inside hooks
- **UI logic** — components
- **Styling** — Tailwind tokens and shadcn variants
- **Configuration** — `src/configs`, `next.config.ts`
- **Types** — `src/types` (shared) and `src/api/types` (transport)

### 4. Barrel exports

Each component/hook/util folder ships an `index.ts(x)` so consumers import via the folder path:

```ts
// Preferred
import { Button, Input, Label } from '@/components/atoms'
import { useAuth, useDialog } from '@/hooks'

// Avoid
import Button from '@/components/atoms/button'
```

---

## Routing & Surfaces

The app uses the **Pages Router** under `src/pages/`. Top-level surfaces:

| Route family                    | Public? | Description                                                          |
| ------------------------------- | ------- | -------------------------------------------------------------------- |
| `/`                             | yes     | Homepage — featured cities, category stats, latest news              |
| `/properties`                   | yes     | Listings browse / search                                             |
| `/listing-detail/[...slug]`     | yes     | Listing detail page (apartment info, gallery, contact)               |
| `/news`, `/news/[slug]`         | yes     | Editorial news section                                               |
| `/maps`                         | yes     | Map view of listings                                                 |
| `/compare`                      | yes     | Side-by-side comparison of saved listings                            |
| `/auth/callback`                | yes     | OAuth callback handler                                               |
| `/saved-listings`, `/following` | no      | Personalized lists (auth required)                                   |
| `/payment/*`                    | mixed   | Payment flow; `/payment/result` is public for gateway redirects      |
| `/sellernet/*`                  | mixed   | Broker storefront — pricing/guides public, personal pages auth-gated |
| `/seller/*`                     | no      | Broker workspace: dashboard, listings, drafts, customers, account    |
| `/404`                          | yes     | Not-found page                                                       |

`src/middleware.ts` is the auth gate. It allowlists the public routes above and, when an unauthenticated user hits a private route, redirects to the same URL with `?auth=login&returnUrl=…` so the client can open the auth dialog and return the user where they intended to go after login.

---

## Data Layer

- **HTTP client** — a single axios instance under `src/configs/axios` attaches auth headers, refresh handling, and base URL.
- **Services** — `src/api/services/*.service.ts` expose typed functions per backend domain. They never hold UI state.
- **Server cache** — TanStack Query owns all server state. The `QueryClient` is created once in `src/pages/_app.tsx`. Hooks under `src/hooks/use*` wrap services in `useQuery` / `useMutation` with stable query keys.
- **Client stores** — Zustand backs cross-route ephemeral state (auth session cache, compare list, …). Don't reach for it when a context or query already fits.
- **Realtime** — push notifications and live updates flow through `@stomp/stompjs` over `sockjs-client`, surfaced through `useNotifications` / `usePush`.

---

## Internationalization

- Default locale: **Vietnamese**. English is loaded lazily when the user toggles language (see `src/pages/_app.tsx` — `vi.json` is bundled, `en.json` is dynamically imported).
- All user-visible strings go through `next-intl`:

  ```tsx
  // Client
  const t = useTranslations('actions')
  return <Button>{t('save')}</Button>

  // Server
  const t = await getTranslations('errors')
  ```

- Add every new key to **both** `src/messages/en.json` and `src/messages/vi.json`. `npm run i18n:check` runs in `pre-commit` and will block missing keys.
- Use ICU placeholders (`{name}`, `{count, plural, …}`) instead of concatenating translated fragments — word order varies between locales.
- Strings that are not user-visible (log messages, internal IDs, analytics event names) do not need translation.

---

## Design System

The full spec lives in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). The short version:

- **Typography** — always go through `<Typography variant="…">`. Pick a variant by _role_ (`pageTitle`, `sectionTitle`, `h3`, `body`, `caption`, `muted`, …), not pixel size. The lint rule `no-inline-heading-sizes` blocks raw `text-2xl` / `text-3xl` / `text-4xl` outside the typography atom itself.
- **Spacing** — for surface-level spacing (cards, sections, page rows) use the named tokens: `p-card`, `p-card-tight`, `gap-row`, `gap-row-lg`, `mb-section`, `mb-section-lg`. The 4pt grid (`p-1`, `p-2`, …) is fine for one-off spacing inside a component.
- **Colors** — use semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`). The `primary-50 … primary-950` scale is available when a fixed shade is genuinely needed. Don't introduce new hex values inline — extend the theme instead.
- **Forms** — use the shadcn form stack (`react-hook-form` + `zod` + the `Form` / `FormField` / `FormItem` primitives in [`src/components/atoms/form.tsx`](src/components/atoms/form.tsx)).
- **Icons** — `lucide-react` only.
- **One component library** — no MUI, Mantine, Chakra, AntD, HeadlessUI, or direct Radix imports outside what shadcn already wraps.

---

## Conventions

### Naming

| Thing                | Convention                                             |
| -------------------- | ------------------------------------------------------ |
| Folders              | camelCase (`userProfile`, `authDialog`)                |
| Dynamic route params | snake_case (`[user_id].tsx`, `[property_slug].tsx`)    |
| Components           | PascalCase (`ListingCard`, `AuthDialog`)               |
| Hooks                | camelCase, `use*` prefix (`useAuth`, `useDebounce`)    |
| Functions            | camelCase (`getUserInfo`, `handleSubmit`)              |
| Constants            | SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`) |
| Types / interfaces   | PascalCase (`UserData`, `ApiResponse`)                 |
| Enums                | PascalCase name, SCREAMING_SNAKE_CASE members          |

### File layout per folder

```
components/atoms/button/
├── index.tsx           # Component
├── index.styled.ts     # styled-components (only when needed)
└── index.scss          # SCSS (only when needed)

hooks/useDebounce/
└── index.tsx

contexts/auth/
└── index.tsx
```

### Adding a page

1. Create the template at `src/components/templates/<pageName>Template/index.tsx` — it owns layout, sections, and data composition.
2. Create the page at `src/pages/<route>.tsx`. The page only:
   - imports the template and a layout from `@/components/layouts/…`
   - declares `getServerSideProps` / `getStaticProps` if it needs server data
   - sets `<SeoHead>` (title, description, canonical, OG tags)
   - attaches the layout via `Page.getLayout = …` and exports as `NextPageWithLayout`

`src/pages/index.tsx` is the canonical example.

### TypeScript discipline

- `any` is only acceptable in `src/api/types/**`. Anywhere else, type it.
- Don't silence Sonar/lint with `// eslint-disable`, `@ts-ignore`, or by widening config — fix the root cause. If a disable is genuinely correct (rare), explain it on the same line.

---

## Quality Gates

A change is not done until **all** of the following pass on the working tree:

```bash
npm run lint        # eslint — 0 errors, 0 new warnings on touched files
npm run typecheck   # tsc --noEmit — exit 0
npm run i18n:check  # en.json / vi.json key parity — exit 0
npm run test        # vitest — passes for any suite covering touched code
```

Run them **after** the last edit, not before. `npm run pre-commit` bundles `typecheck` + `i18n:check` and is the fastest local gate.

SonarQube also runs on the codebase (see [`sonar-project.properties`](./sonar-project.properties)). Watch for and fix on sight: unused vars/imports, duplicated string literals (extract a const), `===`/`!==` only, no `var`, no empty blocks, identical `if/else` branches, function cognitive complexity outside `src/components/organisms/**`.

---

## Documentation

- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — typography, spacing, color, layout tokens
- [`src/CLAUDE.md`](./src/CLAUDE.md) — hard requirements for code under `src/` (Sonar, shadcn, i18n, design system, verification gates)
- [`docs/PRE_COMMIT_HOOKS.md`](./docs/PRE_COMMIT_HOOKS.md) — pre-commit hook details (if present)
- [`docs/QUICK_REFERENCE.md`](./docs/QUICK_REFERENCE.md) — developer cheat sheet (if present)
