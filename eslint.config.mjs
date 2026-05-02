import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
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
]

export default eslintConfig
