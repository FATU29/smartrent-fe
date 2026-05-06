import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

// ─────────────────────────────────────────────────────────────────────────
// Design system rules — defined inline so they ship with the lint config
// and are reviewable in the same PR as the tokens themselves.
//
// `no-inline-heading-sizes` flags raw `text-2xl` / `text-3xl` / … in
// component code. Heading-range sizes carry typographic *role* and must
// flow through <Typography variant="…"> so the type ramp stays a single
// source of truth (see src/styles/globals.css and DESIGN_SYSTEM.md).
//
// Severity is `warn` during the migration; tighten to `error` once the
// known violations are cleared.
// ─────────────────────────────────────────────────────────────────────────
const HEADING_RANGE_RE = /\btext-(2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/

const designSystemPlugin = {
  rules: {
    'no-inline-heading-sizes': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Heading-range Tailwind text sizes (text-2xl and up) must come from <Typography> variants, not inline className.',
        },
        messages: {
          inlineHeading:
            'Heading-range size "{{cls}}" is part of the typography ramp — express it via <Typography variant="…"> or a semantic token (text-display / text-title / text-heading) instead of inline className. See DESIGN_SYSTEM.md.',
        },
        schema: [],
      },
      create(context) {
        function check(node, raw) {
          const m = raw.match(HEADING_RANGE_RE)
          if (m) {
            context.report({
              node,
              messageId: 'inlineHeading',
              data: { cls: m[0] },
            })
          }
        }
        return {
          Literal(node) {
            if (typeof node.value === 'string') check(node, node.value)
          },
          TemplateElement(node) {
            if (node.value && typeof node.value.raw === 'string')
              check(node, node.value.raw)
          },
        }
      },
    },
  },
}

const eslintConfig = [
  // Global ignores — apply before any other config blocks. Without this,
  // ESLint v9 flat config will lint generated/built artifacts (.next, dist,
  // next-env.d.ts) which produce thousands of errors that aren't fixable in
  // source code (they're in compiled vendor output).
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn', // warning if using any
      eqeqeq: ['error', 'always'], // always use ===
      'no-var': 'error', // error if using var
      'react-hooks/exhaustive-deps': 'off', // off for missing dependencies in useEffect
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // Block arbitrary `text-[Npx]` / `text-[Nrem]` Tailwind classes —
      // every text size must come from the scale (text-2xs / text-xs / text-sm
      // / text-md / text-base / text-lg / ...). See tailwind.config.js for
      // the full list. Catches both plain string literals (`className='...'`)
      // and template-literal interpolations (`className={`...`}`), which
      // together cover the patterns in cn()/clsx() calls.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/text-\\[\\d+(\\.\\d+)?(px|rem)\\]/]',
          message:
            'Use a Tailwind text-size token (text-2xs / text-xs / text-sm / text-md / text-base / text-lg / ...) instead of arbitrary text-[Npx]. See tailwind.config.js for the scale.',
        },
        {
          selector:
            'TemplateElement[value.raw=/text-\\[\\d+(\\.\\d+)?(px|rem)\\]/]',
          message:
            'Use a Tailwind text-size token (text-2xs / text-xs / text-sm / text-md / text-base / text-lg / ...) instead of arbitrary text-[Npx]. See tailwind.config.js for the scale.',
        },
      ],
    },
  },
  // Design-system rules layered on top. Scoped away from the typography
  // primitive itself — that file is *allowed* to consume the raw scale
  // because it owns the variant catalog.
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/components/atoms/typography.tsx'],
    plugins: { 'design-system': designSystemPlugin },
    rules: {
      'design-system/no-inline-heading-sizes': 'warn',
    },
  },
]

export default eslintConfig
