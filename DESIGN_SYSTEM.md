# Design System

Single source of truth for typography and spacing. The goal is to keep the
UI visually consistent across pages without each component re-deciding its
own scale.

## Why this exists

Before this layer, components imported `<Typography variant="h6">` and
then overrode the size inline (`text-base md:text-lg`, `text-sm sm:text-base`,
etc.). Different cards picked different micro-text sizes (11/12/13/14px)
for the same kind of label, and section padding ranged from 12px to 40px
with no rule. The variant catalog existed but wasn't load-bearing.

This layer fixes the structure: tokens carry the values, `<Typography>` is
the only legitimate way to set type, and a lint rule catches the most
common bypass.

## Tokens

Defined in [src/styles/globals.css](src/styles/globals.css) inside the
`@theme` block. They generate Tailwind utilities you can use directly
(e.g. `text-title`, `p-card`).

### Typography

| Token             | Size | Role                                     |
| ----------------- | ---- | ---------------------------------------- |
| `text-display-xl` | 48px | Hero h1 at large viewports               |
| `text-display`    | 36px | h1 base, top-of-page hero text           |
| `text-title-lg`   | 30px | Page title (md+), h2                     |
| `text-title`      | 24px | Page title base, h3, section title (sm+) |
| `text-heading`    | 20px | Section heading, h4                      |
| `text-subheading` | 18px | h5, lead-in text                         |
| `text-body`       | 15px | Reading body                             |
| `text-meta`       | 12px | Meta rows, timestamps, secondary labels  |
| `text-micro`      | 11px | Chips, badges, kbd hints                 |

`text-base` (16px) and `text-sm` (14px) remain as Tailwind primitives.
The named tokens above are the ones that carry typographic _role_ — use
them when you mean "this is a heading" rather than "this is 24px."

### Spacing

| Token                | Size | Role                            |
| -------------------- | ---- | ------------------------------- |
| `spacing-row`        | 8px  | Between dense rows (table-like) |
| `spacing-row-lg`     | 12px | Looser rows                     |
| `spacing-card-tight` | 12px | Dense card padding              |
| `spacing-card`       | 16px | Standard card padding           |
| `spacing-section`    | 32px | Between major page sections     |
| `spacing-section-lg` | 40px | Between major sections (lg+)    |

Use as `p-card`, `mb-section`, `gap-row`, etc. The 4pt grid
(`p-1`/`p-2`/`p-3`…) remains available for one-off spacing inside
components — the named tokens are for the _surface_ level (cards,
sections, rows) where consistency across pages matters most.

## How to use

### For type — always go through `<Typography>`

```tsx
// ✅ Correct
<Typography variant="sectionTitle">Latest news</Typography>

// ❌ Wrong — bypasses the variant catalog
<h2 className="text-2xl font-bold">Latest news</h2>
```

The lint rule warns on `text-2xl` / `text-3xl` / … in component code (any
heading-range size). It allows the smaller utilities (`text-base`,
`text-sm`, etc.) because those are legitimately used for body text and
labels where the variant system would be overkill.

### For spacing — prefer named tokens at the surface level

```tsx
// ✅ Correct — semantic
<section className="mb-section">…</section>
<Card className="p-card">…</Card>

// ❌ Avoid — re-decides spacing per component
<section className="mb-10 sm:mb-14">…</section>
<Card className="p-3 sm:p-4">…</Card>
```

No lint rule for spacing yet — we'll add one once the token names settle
and the high-traffic components migrate.

## Migration plan

This PR establishes the system. It is **zero visual diff**: tokens carry
the same values that `<Typography>` variants currently produce, and no
component is migrated yet.

Sequence:

1. **(this PR)** Tokens + lint rule + doc.
2. **Next** — migrate `<Typography>` internals to consume the tokens.
   Pure rename, still zero visual diff. Verifies the tokens compile and
   are wired correctly.
3. **Then** — propose the tightened SaaS scale as a one-line value swap
   on the tokens (the actual visual change). Reviewable in isolation.
4. **Then** — migrate the four highest-traffic components
   (`PropertyCard`, `NewsGridItem`, homepage hero search, section
   headers) to use `<Typography>` exclusively, removing inline overrides.
   Lint warnings drop with each one.
5. **Then** — flip `no-inline-heading-sizes` from `warn` to `error`.

Each step is independently reviewable; we can stop or redirect at any
point without unwinding earlier work.

## Allowlist

The lint rule is scoped _away from_:

- `src/components/atoms/typography.tsx` — owns the variant catalog and is
  allowed to consume the raw Tailwind scale.

Other atoms (`button.tsx`, `input.tsx`, `badge.tsx`) currently use the
raw scale and remain in scope of the rule. They're flagged at `warn` so
existing code keeps working; we'll migrate them in step 4.
