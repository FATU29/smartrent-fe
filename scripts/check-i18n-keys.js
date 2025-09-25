#!/usr/bin/env node
/* eslint-disable */
/*
  Compare translation keys between en.json and vi.json.
  Exits with code 1 if there are missing keys in either file.
*/
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const enPath = path.join(root, 'src', 'messages', 'en.json')
const viPath = path.join(root, 'src', 'messages', 'vi.json')

function readJson(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    console.error(`Failed to read ${p}:`, e.message)
    process.exit(2)
  }
}

function collectLeafKeys(obj, prefix = '', out = new Set()) {
  if (obj === null || obj === undefined) return out
  if (Array.isArray(obj)) {
    // Treat arrays as leaves at this path
    if (prefix) out.add(prefix)
    return out
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) {
      if (prefix) out.add(prefix)
      return out
    }
    for (const k of keys) {
      const next = prefix ? `${prefix}.${k}` : k
      const val = obj[k]
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        collectLeafKeys(val, next, out)
      } else {
        out.add(next)
      }
    }
    return out
  }
  if (prefix) out.add(prefix)
  return out
}

function diffSets(a, b) {
  const missing = []
  for (const k of a) {
    if (!b.has(k)) missing.push(k)
  }
  return missing.sort()
}

const en = readJson(enPath)
const vi = readJson(viPath)

const enKeys = collectLeafKeys(en)
const viKeys = collectLeafKeys(vi)

const missingInVi = diffSets(enKeys, viKeys)
const missingInEn = diffSets(viKeys, enKeys)

let hasIssue = false
if (missingInVi.length) {
  hasIssue = true
  console.log(`Missing in vi.json (${missingInVi.length}):`)
  for (const k of missingInVi) console.log('  -', k)
}
if (missingInEn.length) {
  hasIssue = true
  console.log(`Missing in en.json (${missingInEn.length}):`)
  for (const k of missingInEn) console.log('  -', k)
}

if (!hasIssue) {
  console.log('i18n keys are in sync between en.json and vi.json ✅')
}

process.exit(hasIssue ? 1 : 0)
