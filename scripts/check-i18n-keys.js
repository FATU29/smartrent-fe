#!/usr/bin/env node
/* eslint-disable */
/*
  Enhanced i18n validation script for en.json and vi.json.
  
  Features:
  - Compare translation keys between files
  - Validate placeholder consistency
  - Detect empty values
  - Check placeholder syntax
  - Report detailed statistics
  
  Exits with code 1 if there are issues.
*/
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const enPath = path.join(root, 'src', 'messages', 'en.json')
const viPath = path.join(root, 'src', 'messages', 'vi.json')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function readJson(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    log('red', `Failed to read ${p}: ${e.message}`)
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

function collectLeafKeysWithValues(obj, prefix = '', out = new Map()) {
  if (obj === null || obj === undefined) return out
  if (Array.isArray(obj)) {
    if (prefix) out.set(prefix, JSON.stringify(obj))
    return out
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) {
      if (prefix) out.set(prefix, obj)
      return out
    }
    for (const k of keys) {
      const next = prefix ? `${prefix}.${k}` : k
      const val = obj[k]
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        collectLeafKeysWithValues(val, next, out)
      } else {
        out.set(next, val)
      }
    }
    return out
  }
  if (prefix) out.set(prefix, obj)
  return out
}

function extractPlaceholders(str) {
  if (typeof str !== 'string') return []
  const matches = str.match(/\{[^}]+\}/g)
  return matches ? matches.sort() : []
}

function diffSets(a, b) {
  const missing = []
  for (const k of a) {
    if (!b.has(k)) missing.push(k)
  }
  return missing.sort()
}

function validatePlaceholders(enMap, viMap, commonKeys) {
  const issues = []
  for (const key of commonKeys) {
    const enVal = enMap.get(key)
    const viVal = viMap.get(key)

    const enPlaceholders = extractPlaceholders(enVal)
    const viPlaceholders = extractPlaceholders(viVal)

    if (
      enPlaceholders.length !== viPlaceholders.length ||
      !enPlaceholders.every((p, i) => p === viPlaceholders[i])
    ) {
      issues.push({
        key,
        enPlaceholders,
        viPlaceholders,
        enVal,
        viVal,
      })
    }
  }
  return issues
}

function findEmptyValues(map, lang) {
  const empty = []
  for (const [key, value] of map) {
    if (typeof value === 'string' && value.trim() === '') {
      empty.push(key)
    }
  }
  return empty
}

function printSection(title, items, color = 'yellow') {
  if (items.length > 0) {
    log(color, `\n${colors.bold}${title}${colors.reset}`)
    for (const item of items) {
      console.log(`  ${colors[color]}- ${item}${colors.reset}`)
    }
  }
}

// Main execution
log(
  'cyan',
  `${colors.bold}════════════════════════════════════════════════════════`,
)
log('cyan', '  i18n Translation Validation Report')
log(
  'cyan',
  `════════════════════════════════════════════════════════${colors.reset}\n`,
)

const en = readJson(enPath)
const vi = readJson(viPath)

const enKeys = collectLeafKeys(en)
const viKeys = collectLeafKeys(vi)

const enMap = collectLeafKeysWithValues(en)
const viMap = collectLeafKeysWithValues(vi)

// Statistics
log('blue', `${colors.bold}Statistics:${colors.reset}`)
console.log(
  `  Total keys in en.json: ${colors.cyan}${enKeys.size}${colors.reset}`,
)
console.log(
  `  Total keys in vi.json: ${colors.cyan}${viKeys.size}${colors.reset}`,
)

// Check for missing keys
const missingInVi = diffSets(enKeys, viKeys)
const missingInEn = diffSets(viKeys, enKeys)

let hasIssue = false

if (missingInVi.length) {
  hasIssue = true
  printSection(
    `❌ Missing in vi.json (${missingInVi.length} keys):`,
    missingInVi.slice(0, 20),
    'red',
  )
  if (missingInVi.length > 20) {
    log('red', `  ... and ${missingInVi.length - 20} more`)
  }
}

if (missingInEn.length) {
  hasIssue = true
  printSection(
    `❌ Missing in en.json (${missingInEn.length} keys):`,
    missingInEn.slice(0, 20),
    'red',
  )
  if (missingInEn.length > 20) {
    log('red', `  ... and ${missingInEn.length - 20} more`)
  }
}

// Validate placeholders for common keys
const commonKeys = [...enKeys].filter((k) => viKeys.has(k))
const placeholderIssues = validatePlaceholders(enMap, viMap, commonKeys)

if (placeholderIssues.length > 0) {
  hasIssue = true
  log(
    'yellow',
    `\n${colors.bold}⚠️  Placeholder Mismatches (${placeholderIssues.length}):${colors.reset}`,
  )
  for (const issue of placeholderIssues.slice(0, 10)) {
    console.log(`\n  ${colors.yellow}Key: ${issue.key}${colors.reset}`)
    console.log(`    EN: "${issue.enVal}"`)
    console.log(`    VI: "${issue.viVal}"`)
    console.log(`    EN placeholders: [${issue.enPlaceholders.join(', ')}]`)
    console.log(`    VI placeholders: [${issue.viPlaceholders.join(', ')}]`)
  }
  if (placeholderIssues.length > 10) {
    log(
      'yellow',
      `\n  ... and ${placeholderIssues.length - 10} more placeholder issues`,
    )
  }
}

// Check for empty values
const emptyInEn = findEmptyValues(enMap, 'en')
const emptyInVi = findEmptyValues(viMap, 'vi')

if (emptyInEn.length > 0) {
  hasIssue = true
  printSection(
    `⚠️  Empty values in en.json (${emptyInEn.length}):`,
    emptyInEn,
    'yellow',
  )
}

if (emptyInVi.length > 0) {
  hasIssue = true
  printSection(
    `⚠️  Empty values in vi.json (${emptyInVi.length}):`,
    emptyInVi,
    'yellow',
  )
}

// Summary
log(
  'cyan',
  `\n${colors.bold}════════════════════════════════════════════════════════${colors.reset}`,
)
if (!hasIssue) {
  log(
    'green',
    `${colors.bold}✅ All checks passed! Translation files are in sync.${colors.reset}`,
  )
  console.log(`   - ${enKeys.size} keys validated`)
  console.log(`   - ${commonKeys.length} keys with matching placeholders`)
  console.log(`   - No missing or empty translations`)
} else {
  log(
    'red',
    `${colors.bold}❌ Issues found in translation files:${colors.reset}`,
  )
  if (missingInVi.length)
    console.log(`   - ${missingInVi.length} keys missing in vi.json`)
  if (missingInEn.length)
    console.log(`   - ${missingInEn.length} keys missing in en.json`)
  if (placeholderIssues.length)
    console.log(`   - ${placeholderIssues.length} placeholder mismatches`)
  if (emptyInEn.length)
    console.log(`   - ${emptyInEn.length} empty values in en.json`)
  if (emptyInVi.length)
    console.log(`   - ${emptyInVi.length} empty values in vi.json`)
}
log(
  'cyan',
  `════════════════════════════════════════════════════════${colors.reset}\n`,
)

process.exit(hasIssue ? 1 : 0)
