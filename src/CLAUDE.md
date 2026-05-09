# Frontend `src/` rules

Scope: everything under `smartrent-fe/src/`. These are hard requirements — code
that violates them is not done.

## 1. Must pass Sonar

Config: [../sonar-project.properties](../sonar-project.properties).

- Do not introduce new violations of rules that are **not** in the
  `sonar.issue.ignore.multicriteria` allowlist. The allowlist is the only
  escape hatch and it is full (e1–e10) — adding a new ignore needs an
  explicit reason and a slot rotation, not silent expansion.
- Do not widen `sonar.exclusions` or `sonar.cpd.exclusions` to make a file
  pass. Fix the file instead.
- Specifically watch for, and fix on sight: unused vars/imports, duplicated
  string literals (extract a const), `===`/`!==` only, no `var`, no empty
  blocks, identical `if/else` branches, function cognitive complexity
  outside `src/components/organisms/**` (which is allow-listed).
- `any` is only acceptable in `src/api/types/**`. Anywhere else, type it.
- Test, story, mock, message, and constants files are excluded from
  analysis — that is not a license to write sloppy code there, but Sonar
  will not flag it.

## 2. shadcn is the component baseline

Config: [../components.json](../components.json). Style `new-york`,
`tsx: true`, alias `ui → @/components/atoms`, icons from `lucide-react`.

- Atoms in [components/atoms/](components/atoms/) are shadcn primitives
  (`button.tsx`, `input.tsx`, `dialog.tsx`, `form.tsx`, …). When you need a
  primitive that already exists there, **import it — do not re-implement**.
- When you need a primitive that does not exist, add it via shadcn (or
  hand-author following the same pattern: `cva` variants, `cn()` for class
  merging, `forwardRef`, `displayName`) and place it in `components/atoms/`.
  Re-export from [components/atoms/index.ts](components/atoms/index.ts).
- Do not pull in a second component library (MUI, Mantine, Chakra, AntD,
  HeadlessUI, Radix-direct outside what shadcn already wraps). One system.
- Icons come from `lucide-react`. Do not mix in `react-icons`,
  `@heroicons/react`, etc.
- Composition layers stay layered: `atoms → molecules → organisms →
templates → pages`. An atom never imports from molecules/organisms.

## 3. All user-visible strings go through `next-intl`

Setup: [messages/en.json](messages/en.json) +
[messages/vi.json](messages/vi.json), checked by
`scripts/check-i18n-keys.js` (runs in `pre-commit`).

- Any string the user reads — labels, buttons, placeholders, toasts,
  errors, empty-state copy, alt text, page titles — uses
  `useTranslations()` (client) or `getTranslations()` (server). No
  hard-coded English or Vietnamese in JSX/`.ts` files.
- Add the key to **both** `en.json` and `vi.json` in the same change. The
  `i18n:check` script will fail the commit if a key is missing from either
  locale, and Sonar will flag you for the duplicated literal anyway.
- Use the existing namespace structure (`actions.*`, `errors.*`,
  `states.*`, …). Group related keys; do not flatten everything to the
  top level.
- Use ICU placeholders (`{name}`, `{count, plural, …}`) instead of string
  concatenation. Never build a sentence by joining translated fragments —
  word order differs across locales.
- Strings that are genuinely not user-visible (log messages, dev errors,
  internal IDs, test fixtures, analytics event names) do not need
  translation.

## 4. Follow the design system

Spec: [../DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md). Tokens live in
[styles/globals.css](styles/globals.css). Lint rule
`no-inline-heading-sizes` is in [../eslint.config.mjs](../eslint.config.mjs).

### Typography

- Use [`<Typography variant="…">`](components/atoms/typography.tsx) for
  every heading and body block. Pick the variant by **role**
  (`pageTitle`, `sectionTitle`, `h3`, `body`, `caption`, `muted`, …), not
  by pixel size.
- Do **not** write `text-2xl` / `text-3xl` / `text-4xl` / … inline. The
  lint rule warns today and will be promoted to error — new code must
  already comply. The only file allowed to use those raw classes is
  `components/atoms/typography.tsx` itself.
- For sizes inside the heading ramp, prefer the semantic tokens
  (`text-display`, `text-title-lg`, `text-title`, `text-heading`,
  `text-subheading`, `text-body`, `text-meta`, `text-micro`) over raw
  Tailwind sizes when you do need a className.
- `text-base` (16px) and `text-sm` (14px) remain fine for body/labels.

### Spacing

- At the **surface** level (cards, sections, page rows) use the named
  tokens: `p-card`, `p-card-tight`, `gap-row`, `gap-row-lg`, `mb-section`,
  `mb-section-lg`. They exist so spacing stays consistent across pages.
- The 4pt grid (`p-1`, `p-2`, …) is fine for one-off spacing **inside** a
  component. Do not use it to re-decide card or section padding.

### Colors

- Use the semantic theme tokens (`bg-background`, `text-foreground`,
  `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`,
  `text-destructive`, …) defined in
  [../tailwind.config.js](../tailwind.config.js). They are wired to CSS
  variables and respect dark mode.
- The numeric primary scale (`primary-50` … `primary-950`) is available
  when you genuinely need a fixed shade. Do not introduce new hex values
  in components — if a shade is missing, add it to the theme, not inline.

### Forms

- Use the shadcn form stack: `react-hook-form` + `zod` + the `Form`,
  `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
  primitives from [components/atoms/form.tsx](components/atoms/form.tsx).
  Don't roll a one-off form layout.

## 5. Verify the code before declaring done

Scripts live in [../package.json](../package.json). A change is not
finished until **all** of these run cleanly against the working tree:

```bash
npm run lint        # eslint — must end with 0 errors and 0 warnings on touched files
npm run typecheck   # tsc --noEmit — must exit 0
npm run i18n:check  # validates en.json / vi.json key parity — must exit 0
npm run test        # vitest — must pass for any suite that covers touched code
```

Rules:

- Run them after the last edit, not before. A green run from earlier in
  the session does not count once you've made more changes.
- Fix the **root cause** of any failure. Do not silence it with
  `// eslint-disable`, `@ts-ignore`, `@ts-expect-error`, casts to `any`,
  `it.skip`, or by widening Sonar / ESLint config to make the rule stop
  firing. If a disable is genuinely the right call (rare), it gets a
  one-line comment explaining why on the same line.
- Warnings count. `npm run lint` exits 0 with warnings — but new
  warnings in code you touched are still a fail under this rule.
- Before handing the change back, paste the commands you ran and their
  exit status into the final message. Don't claim success without
  having actually run them.
- If something genuinely cannot be verified (no dev server available,
  external API down, etc.), say so explicitly — never imply a check
  passed when it was skipped.

`npm run pre-commit` runs `typecheck` + `i18n:check` together and is the
fastest way to gate before committing.

## 6. New pages go through a template

Pattern in this repo: [pages/](pages/) files are thin shells; the actual
UI lives in [components/templates/](components/templates/). See
[pages/index.tsx](pages/index.tsx) consuming
[components/templates/homepage/](components/templates/homepage/) for the
canonical example.

When adding a new page:

1. **Create the template first** in
   `src/components/templates/<pageName>Template/index.tsx` (kebab/camel
   names already vary in the folder — match the closest sibling). The
   template owns the layout, sections, data composition, and any local
   state. Build it from existing organisms/molecules/atoms; do not inline
   ad-hoc UI that should be a reusable molecule.
2. **Then create the page** in `src/pages/<route>.tsx`. The page file
   should only:
   - import the template and a layout from `@/components/layouts/…`,
   - declare `getServerSideProps` / `getStaticProps` and pass data into
     the template,
   - set `<SeoHead>` (title, description, canonical, OG tags) — every
     user-facing route must have one,
   - attach the layout via `Page.getLayout = …` and export as
     `NextPageWithLayout` (see `pages/index.tsx`).
3. Page files do **not** contain JSX beyond `<Layout><Template …/></Layout>`
   plus `<SeoHead>`. If you find yourself writing markup in
   `src/pages/**`, lift it into the template.
4. The template still obeys §1–§4: shadcn atoms, `next-intl` for copy,
   `<Typography>` for headings, semantic spacing/color tokens, no Sonar
   regressions.

These rules apply to all source code under `src/` — not just to this
`CLAUDE.md`. Same scope as the rest of the file.

## Quick checklist before finishing a change

- [ ] `npm run lint`, `npm run typecheck`, `npm run i18n:check`, and relevant `npm run test` all pass — and you ran them after the last edit
- [ ] No new Sonar issues, no new lint warnings on touched files, no `eslint-disable` / `@ts-ignore` added without a comment
- [ ] No hard-coded user-visible strings; keys added to `en.json` **and** `vi.json`
- [ ] No `text-2xl+` inline; headings go through `<Typography>`
- [ ] Surface-level spacing uses `p-card` / `mb-section` / `gap-row` tokens
- [ ] Reused existing atoms instead of re-implementing primitives
- [ ] New pages: thin `src/pages/*.tsx` shell + template under `src/components/templates/`, with `<SeoHead>` and a layout
