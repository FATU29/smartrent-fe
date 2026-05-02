// Codemod: replace arbitrary `text-[Npx]` / `text-[Nrem]` Tailwind classes
// with the tokens defined in tailwind.config.js.
//
// Token mapping:
//   text-[10px]    → text-2xs   (11px — collapsed; ±1px is imperceptible)
//   text-[11px]    → text-2xs
//   text-[14px]    → text-sm    (already identical, just literal redundancy)
//   text-[15px]    → text-md    (new token between sm and base)
//   text-[1.75rem] → text-3xl   (28→30px, single occurrence)
//
// Usage:  node scripts/codemod-typography-tokens.mjs
// Run from the repo root.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', 'src')

const REPLACEMENTS = [
  [/!?text-\[10px\]/g, 'text-2xs'],
  [/!?text-\[11px\]/g, 'text-2xs'],
  [/!?text-\[14px\]/g, 'text-sm'],
  [/!?text-\[15px\]/g, 'text-md'],
  [/text-\[1\.75rem\]/g, 'text-3xl'],
]

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) yield full
  }
}

let touched = 0
let totalReplacements = 0

for await (const file of walk(ROOT)) {
  const before = await fs.readFile(file, 'utf8')
  let after = before
  let fileReplacements = 0
  for (const [pat, rep] of REPLACEMENTS) {
    const matches = after.match(pat)
    if (matches) {
      fileReplacements += matches.length
      after = after.replace(pat, rep)
    }
  }
  if (after !== before) {
    await fs.writeFile(file, after)
    touched++
    totalReplacements += fileReplacements
    console.log(
      `  ${fileReplacements.toString().padStart(2)} × ${path.relative(process.cwd(), file)}`,
    )
  }
}

console.log(
  `\nDone. ${touched} files updated, ${totalReplacements} replacements.`,
)
