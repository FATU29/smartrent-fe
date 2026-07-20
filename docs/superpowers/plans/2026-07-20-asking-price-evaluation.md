# Asking-Price Evaluation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the user how their asking price compares to the AI-suggested range in the đăng bài valuation step.

**Architecture:** One pure function (`evaluateAskingPrice`) in a new file computes a verdict from data already in context — no network calls, no AI/backend changes. The existing `aiValuationSection.tsx` renders its result below the evidence line added by #465. The function returns `null` for every unusable input, and the UI renders nothing in that case.

**Tech Stack:** TypeScript, React, next-intl, vitest, Tailwind.

## Global Constraints

- **Repo:** smartrent-fe only. Do NOT modify smartrent-ai or smartrent-backend.
- **Worktree:** `C:\Users\huynh\AppData\Local\Temp\claude\d--DEV-datn\b65821b0-9c47-47b0-b5ff-82e684a58a6a\scratchpad\fe-valuation`, branch `feat/asking-price-evaluation` (already created off `origin/main`). Use absolute paths for file tools — a `cd` in Bash shifts the cwd.
- **Package manager:** `pnpm`. Tests: `pnpm test:run`. Lint: `pnpm lint <paths>`. i18n gate: `pnpm i18n:check`.
- **Informational only.** Never block navigation, never disable the submit button, never gate a step.
- **Strong-deviation threshold:** exactly `25` percent, exported as `STRONG_DEVIATION_PERCENT`.
- **Range bounds are inclusive:** `p === min` and `p === max` are both `fair`.
- **Severity is decided on the raw unrounded deviation;** only `differencePercent` is rounded (1 decimal).
- **Hide the verdict only on positive evidence of unreliability** — `source === 'rule_based_fallback'` or `listings_found === 0`. When those fields are `undefined`, still evaluate.
- **Commits:** do NOT add `Co-Authored-By` trailers. The pre-commit hook runs a full typecheck that fails on unmodified `origin/main` in a clean install (phantom deps `framer-motion`, `@radix-ui/react-visually-hidden` missing from `package.json`); commit with `--no-verify` and verify separately, as in #465.
- **Do NOT commit `pnpm-lock.yaml`** — it is untracked in this repo.

## File Structure

| File | Responsibility |
|---|---|
| `src/utils/ai/priceEvaluation.ts` (create) | Pure comparison logic. No React, no i18n, no formatting. |
| `src/utils/ai/priceEvaluation.test.ts` (create) | vitest coverage of the function. |
| `src/messages/vi.json`, `src/messages/en.json` (modify) | New keys under `createPost.sections.aiValuation.results.priceEvaluation`. |
| `src/components/organisms/createPostSections/aiValuationSection.tsx` (modify) | Renders the verdict. Owns colours and copy; holds no comparison logic. |

Kept out of `src/utils/ai/housingPredictor.ts` on purpose — that file already owns address resolution and request building.

---

### Task 1: Pure evaluation function

**Files:**
- Create: `src/utils/ai/priceEvaluation.ts`
- Test: `src/utils/ai/priceEvaluation.test.ts`

**Interfaces:**
- Consumes: `HousingPredictorResponse` from `@/api/types/ai.type` (has `price_range: {min, max}`, and optional `source`, `listings_found`, `confidence`); `PriceUnit` from `@/api/types/property.type` (`'MONTH' | 'YEAR' | 'DAY'`).
- Produces: `evaluateAskingPrice(price, priceUnit, prediction): PriceEvaluation | null`, plus exported types `PriceVerdict`, `PriceSeverity`, `PriceEvaluation` and the constant `STRONG_DEVIATION_PERCENT`. Task 2 imports all of these.

- [ ] **Step 1: Write the failing test**

Create `src/utils/ai/priceEvaluation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import type { HousingPredictorResponse } from '@/api/types/ai.type'

import { STRONG_DEVIATION_PERCENT, evaluateAskingPrice } from './priceEvaluation'

const prediction = (
  overrides: Partial<HousingPredictorResponse> = {},
): HousingPredictorResponse => ({
  price_range: { min: 5_000_000, max: 8_000_000 },
  location: 'Thanh Xuân, Hà Nội',
  property_type: 'APARTMENT',
  currency: 'VND',
  source: 'ai_comparables',
  listings_found: 12,
  confidence: 'medium',
  ...overrides,
})

describe('evaluateAskingPrice', () => {
  describe('inside the range', () => {
    it('is fair with no deviation', () => {
      const result = evaluateAskingPrice(6_500_000, 'MONTH', prediction())
      expect(result).toEqual({
        verdict: 'fair',
        severity: null,
        differencePercent: 0,
        normalizedMonthlyPrice: 6_500_000,
      })
    })

    it('treats the lower bound as fair', () => {
      expect(evaluateAskingPrice(5_000_000, 'MONTH', prediction())?.verdict).toBe(
        'fair',
      )
    })

    it('treats the upper bound as fair', () => {
      expect(evaluateAskingPrice(8_000_000, 'MONTH', prediction())?.verdict).toBe(
        'fair',
      )
    })
  })

  describe('above the range', () => {
    it('is mild at 10% over the max', () => {
      const result = evaluateAskingPrice(8_800_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('above')
      expect(result?.severity).toBe('mild')
      expect(result?.differencePercent).toBe(10)
    })

    it('is strong at 50% over the max', () => {
      const result = evaluateAskingPrice(12_000_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('above')
      expect(result?.severity).toBe('strong')
      expect(result?.differencePercent).toBe(50)
    })

    it('is still mild exactly at the threshold', () => {
      const atThreshold = 8_000_000 * (1 + STRONG_DEVIATION_PERCENT / 100)
      expect(evaluateAskingPrice(atThreshold, 'MONTH', prediction())?.severity).toBe(
        'mild',
      )
    })

    it('decides severity on the raw value, not the rounded one', () => {
      // 25.04% over the max rounds to 25.0 but must still count as strong.
      const justOver = 8_000_000 * 1.2504
      const result = evaluateAskingPrice(justOver, 'MONTH', prediction())
      expect(result?.differencePercent).toBe(25)
      expect(result?.severity).toBe('strong')
    })
  })

  describe('below the range', () => {
    it('is mild at 10% under the min', () => {
      const result = evaluateAskingPrice(4_500_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('below')
      expect(result?.severity).toBe('mild')
      expect(result?.differencePercent).toBe(10)
    })

    it('is strong at 50% under the min', () => {
      const result = evaluateAskingPrice(2_500_000, 'MONTH', prediction())
      expect(result?.verdict).toBe('below')
      expect(result?.severity).toBe('strong')
      expect(result?.differencePercent).toBe(50)
    })
  })

  describe('unit conversion', () => {
    it('converts a yearly price to monthly before comparing', () => {
      // 78M/year = 6.5M/month, inside the range.
      const result = evaluateAskingPrice(78_000_000, 'YEAR', prediction())
      expect(result?.verdict).toBe('fair')
      expect(result?.normalizedMonthlyPrice).toBe(6_500_000)
    })

    it('does not compare a yearly price as if it were monthly', () => {
      // Without conversion this would read as wildly above the range.
      expect(evaluateAskingPrice(78_000_000, 'YEAR', prediction())?.verdict).not.toBe(
        'above',
      )
    })

    it('refuses units it cannot convert', () => {
      expect(evaluateAskingPrice(200_000, 'DAY', prediction())).toBeNull()
      expect(evaluateAskingPrice(6_500_000, undefined, prediction())).toBeNull()
    })
  })

  describe('unusable input', () => {
    it.each([undefined, 0, -1, NaN])('returns null for price %s', (price) => {
      expect(evaluateAskingPrice(price as number, 'MONTH', prediction())).toBeNull()
    })

    it('returns null without a prediction', () => {
      expect(evaluateAskingPrice(6_500_000, 'MONTH', null)).toBeNull()
    })

    it('returns null for an invalid range', () => {
      expect(
        evaluateAskingPrice(
          6_500_000,
          'MONTH',
          prediction({ price_range: { min: 0, max: 8_000_000 } }),
        ),
      ).toBeNull()
      expect(
        evaluateAskingPrice(
          6_500_000,
          'MONTH',
          prediction({ price_range: { min: 9_000_000, max: 8_000_000 } }),
        ),
      ).toBeNull()
    })
  })

  describe('evidence gating', () => {
    it('stays silent on a rule-based fallback range', () => {
      expect(
        evaluateAskingPrice(
          12_000_000,
          'MONTH',
          prediction({ source: 'rule_based_fallback' }),
        ),
      ).toBeNull()
    })

    it('stays silent when no comparable listings backed the range', () => {
      expect(
        evaluateAskingPrice(12_000_000, 'MONTH', prediction({ listings_found: 0 })),
      ).toBeNull()
    })

    it('still evaluates when the evidence fields are absent', () => {
      // Missing information is not evidence of a fallback; refusing here would
      // make the feature vanish silently whenever a field is omitted.
      const result = evaluateAskingPrice(
        6_500_000,
        'MONTH',
        prediction({ source: undefined, listings_found: undefined }),
      )
      expect(result?.verdict).toBe('fair')
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:run src/utils/ai/priceEvaluation.test.ts`
Expected: FAIL — `Failed to resolve import "./priceEvaluation"`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/ai/priceEvaluation.ts`:

```ts
import type { HousingPredictorResponse } from '@/api/types/ai.type'
import type { PriceUnit } from '@/api/types/property.type'

export type PriceVerdict = 'below' | 'fair' | 'above'
export type PriceSeverity = 'mild' | 'strong'

export interface PriceEvaluation {
  verdict: PriceVerdict
  /** null when the verdict is 'fair' */
  severity: PriceSeverity | null
  /** Percent away from the nearest bound, rounded to 1 decimal. 0 when inside. */
  differencePercent: number
  /** The monthly VND figure actually compared against the range. */
  normalizedMonthlyPrice: number
}

/** Deviation beyond a range bound, in percent, past which the gap is reported
 *  as significant rather than moderate. A guess pending real feedback — named
 *  so it is cheap to retune. */
export const STRONG_DEVIATION_PERCENT = 25

const MONTHS_PER_YEAR = 12

const isPositiveFinite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

/** The AI always quotes a monthly rent, so a yearly asking price has to be
 *  brought onto the same footing before any comparison means anything. */
const toMonthly = (price: number, unit: PriceUnit | undefined): number | null => {
  if (unit === 'MONTH') return price
  if (unit === 'YEAR') return price / MONTHS_PER_YEAR
  // 'DAY' exists on the type but the create-post validation schema rejects it.
  // Refuse rather than invent a conversion factor and be wrong by ~30x.
  return null
}

export const evaluateAskingPrice = (
  price: number | undefined,
  priceUnit: PriceUnit | undefined,
  prediction: HousingPredictorResponse | null,
): PriceEvaluation | null => {
  if (!isPositiveFinite(price)) return null
  if (!prediction) return null

  // Say nothing when the range itself is not backed by market data. Claiming
  // "your price is 40% above market" off a hardcoded table would be worse than
  // staying quiet. Only positive evidence of unreliability suppresses the
  // verdict — absent fields do not.
  if (prediction.source === 'rule_based_fallback') return null
  if (prediction.listings_found === 0) return null

  const min = prediction.price_range?.min
  const max = prediction.price_range?.max
  if (!isPositiveFinite(min) || !isPositiveFinite(max) || min > max) return null

  const monthly = toMonthly(price, priceUnit)
  if (monthly === null || !isPositiveFinite(monthly)) return null

  if (monthly >= min && monthly <= max) {
    return {
      verdict: 'fair',
      severity: null,
      differencePercent: 0,
      normalizedMonthlyPrice: monthly,
    }
  }

  const isBelow = monthly < min
  // Unrounded on purpose: rounding first would misfile 25.04% as mild.
  const rawDeviation = isBelow
    ? ((min - monthly) / min) * 100
    : ((monthly - max) / max) * 100

  return {
    verdict: isBelow ? 'below' : 'above',
    severity: rawDeviation > STRONG_DEVIATION_PERCENT ? 'strong' : 'mild',
    differencePercent: Math.round(rawDeviation * 10) / 10,
    normalizedMonthlyPrice: monthly,
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:run src/utils/ai/priceEvaluation.test.ts`
Expected: PASS, 20 tests.

- [ ] **Step 5: Lint the new files**

Run: `pnpm lint src/utils/ai/priceEvaluation.ts src/utils/ai/priceEvaluation.test.ts`
Expected: no output (clean).

- [ ] **Step 6: Commit**

```bash
git add src/utils/ai/priceEvaluation.ts src/utils/ai/priceEvaluation.test.ts
git commit --no-verify -m "feat(ai-valuation): compare the asking price against the suggested range

Pure function, no network. Returns null for every unusable input so the
caller only has to check for null.

Two decisions worth noting:
- A yearly asking price is converted to monthly before comparison; the AI
  always quotes a monthly rent, so comparing raw would be wrong by 12x.
- The verdict is suppressed when the range came from the rule-based
  fallback or had no comparable listings behind it. Absent evidence fields
  do not suppress it - missing information is not evidence of a fallback."
```

---

### Task 2: Render the verdict

**Files:**
- Modify: `src/messages/vi.json`, `src/messages/en.json` — add `createPost.sections.aiValuation.results.priceEvaluation`
- Modify: `src/components/organisms/createPostSections/aiValuationSection.tsx`

**Interfaces:**
- Consumes: `evaluateAskingPrice` and `PriceEvaluation` from Task 1; `propertyInfo.price` / `propertyInfo.priceUnit` from `useCreatePost()`; the existing local `formatPrice(price: number)` helper (line 137) and `prediction` state.
- Produces: no new exports. This is the last code task.

- [ ] **Step 1: Add the Vietnamese keys**

In `src/messages/vi.json`, inside `createPost.sections.aiValuation.results`, add a `priceEvaluation` object alongside the existing `fallbackNotice` / `basedOnListings` / `confidenceLabel` keys:

```json
"priceEvaluation": {
  "yourPrice": "Giá bạn đang đặt",
  "perMonth": "/tháng",
  "perYear": "/năm",
  "fair": "Hợp lý",
  "above": "Cao hơn thị trường",
  "aboveStrong": "Cao hơn thị trường đáng kể",
  "below": "Thấp hơn thị trường",
  "belowStrong": "Thấp hơn thị trường đáng kể",
  "inRange": "Nằm trong khoảng AI đề xuất",
  "deviationAbove": "Cao hơn khoảng đề xuất {percent}%",
  "deviationBelow": "Thấp hơn khoảng đề xuất {percent}%"
}
```

- [ ] **Step 2: Add the English keys**

In `src/messages/en.json`, same location:

```json
"priceEvaluation": {
  "yourPrice": "Your asking price",
  "perMonth": "/month",
  "perYear": "/year",
  "fair": "Reasonable",
  "above": "Above market",
  "aboveStrong": "Well above market",
  "below": "Below market",
  "belowStrong": "Well below market",
  "inRange": "Within the AI-suggested range",
  "deviationAbove": "{percent}% above the suggested range",
  "deviationBelow": "{percent}% below the suggested range"
}
```

- [ ] **Step 3: Verify the translation files stay in sync**

Run: `pnpm i18n:check`
Expected: `✅ All checks passed! Translation files are in sync.` — the `{percent}` placeholder must match across both files.

- [ ] **Step 4: Import the function in the section**

In `src/components/organisms/createPostSections/aiValuationSection.tsx`, add below the existing `@/utils/ai/housingPredictor` import block (currently lines 25-30):

```tsx
import { evaluateAskingPrice } from '@/utils/ai/priceEvaluation'
```

- [ ] **Step 5: Derive the evaluation and its presentation**

In the same file, immediately after the `confidenceDotClass` declaration (currently ends around line 180, just before `const canPredict = !!predictionRequest`), insert:

```tsx
  const priceEvaluation = useMemo(
    () =>
      evaluateAskingPrice(
        propertyInfo.price,
        propertyInfo.priceUnit,
        prediction,
      ),
    [propertyInfo.price, propertyInfo.priceUnit, prediction],
  )

  const priceUnitSuffix =
    propertyInfo.priceUnit === 'YEAR'
      ? t('results.priceEvaluation.perYear')
      : t('results.priceEvaluation.perMonth')

  // Colour and wording for the verdict. Green reads as "no action needed",
  // amber as "worth a second look", red as "probably a mistake".
  const evaluationTone = useMemo(() => {
    if (!priceEvaluation) return null

    if (priceEvaluation.verdict === 'fair') {
      return {
        box: 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40',
        text: 'text-green-700 dark:text-green-400',
        label: t('results.priceEvaluation.fair'),
      }
    }

    const isStrong = priceEvaluation.severity === 'strong'
    const isAbove = priceEvaluation.verdict === 'above'

    return {
      box: isStrong
        ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
        : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
      text: isStrong
        ? 'text-red-700 dark:text-red-400'
        : 'text-amber-700 dark:text-amber-400',
      label: isAbove
        ? t(
            isStrong
              ? 'results.priceEvaluation.aboveStrong'
              : 'results.priceEvaluation.above',
          )
        : t(
            isStrong
              ? 'results.priceEvaluation.belowStrong'
              : 'results.priceEvaluation.below',
          ),
    }
  }, [priceEvaluation, t])
```

- [ ] **Step 6: Render the block**

In the same file, find the `</div>` that closes the suggested-price wrapper (the one immediately followed by the `{/* Price Details */}` comment, currently line 284). Insert this block between that `</div>` and the `{/* Price Details */}` comment:

```tsx
                {/* How the user's own price sits against the range. Rendered
                    only when the range is backed by comparable listings -
                    evaluateAskingPrice returns null otherwise. */}
                {priceEvaluation && evaluationTone && (
                  <div className={`rounded-xl border p-4 ${evaluationTone.box}`}>
                    <div className='flex items-center justify-between gap-3 mb-1'>
                      <span className='text-sm text-muted-foreground'>
                        {t('results.priceEvaluation.yourPrice')}
                      </span>
                      <span className='text-sm font-semibold text-foreground'>
                        {formatPrice(propertyInfo.price as number)}
                        {priceUnitSuffix}
                      </span>
                    </div>
                    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                      <span
                        className={`text-sm font-semibold ${evaluationTone.text}`}
                      >
                        {evaluationTone.label}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {priceEvaluation.verdict === 'fair'
                          ? t('results.priceEvaluation.inRange')
                          : priceEvaluation.verdict === 'above'
                            ? t('results.priceEvaluation.deviationAbove', {
                                percent: priceEvaluation.differencePercent,
                              })
                            : t('results.priceEvaluation.deviationBelow', {
                                percent: priceEvaluation.differencePercent,
                              })}
                      </span>
                    </div>
                  </div>
                )}
```

- [ ] **Step 7: Lint and typecheck the section**

Run: `pnpm lint src/components/organisms/createPostSections/aiValuationSection.tsx`
Expected: no output.

Run: `pnpm typecheck 2>&1 | grep -E "aiValuationSection|priceEvaluation"`
Expected: no output — no errors in the touched files. (The repo has pre-existing typecheck errors in other files; see Task 3.)

- [ ] **Step 8: Commit**

```bash
git add src/messages/vi.json src/messages/en.json src/components/organisms/createPostSections/aiValuationSection.tsx
git commit --no-verify -m "feat(ai-valuation): show how the asking price compares to the range

Renders below the evidence line: the price the user entered, a verdict,
and how far outside the suggested range it falls. Green when inside,
amber when moderately outside, red past 25% beyond a bound.

Nothing renders when evaluateAskingPrice returns null, which includes the
case where the range came from the rule-based fallback - a verdict drawn
from a hardcoded table would undo the point of surfacing the fallback in
the first place."
```

---

### Task 3: Verify and open the PR

**Files:** none modified.

**Interfaces:**
- Consumes: the working tree from Tasks 1-2.
- Produces: a pushed branch and an open PR.

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test:run`
Expected: all files pass. Before this change the suite was 39 tests across 6 files; expect 59 across 7.

- [ ] **Step 2: Confirm no new typecheck errors**

Run: `pnpm typecheck 2>&1 | grep -c "error TS"`
Expected: `24` — the same pre-existing count measured on unmodified `origin/main`. Any higher number means this change introduced errors; investigate before continuing.

To re-measure the baseline if the number differs:

```bash
git stash -u && pnpm typecheck 2>&1 | grep -c "error TS"; git stash pop
```

- [ ] **Step 3: Confirm the i18n gate**

Run: `pnpm i18n:check`
Expected: `✅ All checks passed! Translation files are in sync.`

- [ ] **Step 4: Confirm the lockfile was not staged**

Run: `git status --porcelain`
Expected: `pnpm-lock.yaml` still shows as untracked (`??`), never staged or committed.

- [ ] **Step 5: Push the branch**

```bash
git push -u origin feat/asking-price-evaluation
```

- [ ] **Step 6: Open the PR**

```bash
gh pr create --base main --title "feat(ai-valuation): đánh giá giá chào bán so với khoảng AI đề xuất"
```

Body must cover: what the step showed before versus now; the four design decisions (FE-only, informational, range-based thresholds, hidden when evidence is weak); the yearly-price conversion; the verification numbers from Steps 1-3; and a note that the commits used `--no-verify` because the pre-commit typecheck fails on unmodified `origin/main` in a clean install due to the two phantom dependencies.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Pure function, file location, signature | 1 |
| Six null conditions | 1 (Steps 1, 3) |
| Undefined evidence fields still evaluate | 1 (test `still evaluates when the evidence fields are absent`) |
| MONTH/YEAR conversion, DAY refused | 1 (`toMonthly`, `refuses units it cannot convert`) |
| Threshold table, inclusive bounds | 1 (`inside the range` + `above`/`below` describes) |
| Rounding vs severity on raw value | 1 (`decides severity on the raw value`) |
| `STRONG_DEVIATION_PERCENT` named constant | 1 |
| UI placement below the evidence line | 2 (Step 6) |
| Colour mapping green/amber/red | 2 (Step 5, `evaluationTone`) |
| Display in the user's chosen unit | 2 (`priceUnitSuffix`) |
| Render nothing when null | 2 (Step 6 guard) |
| i18n keys with `{percent}` | 2 (Steps 1-3) |
| Every listed test case | 1 (Step 1) |
| No blocking, no AI call, no inline price editing | Global Constraints |
| Update-post flow inherits the change | No task needed — shared component, verified during design |

**Placeholder scan:** none — every code step carries complete code, every command carries expected output.

**Type consistency:** `PriceEvaluation` fields (`verdict`, `severity`, `differencePercent`, `normalizedMonthlyPrice`) are named identically in Task 1's interface, Task 1's tests, and Task 2's JSX. `evaluateAskingPrice` takes `(price, priceUnit, prediction)` in that order in both tasks. `STRONG_DEVIATION_PERCENT` is exported in Task 1 and consumed by Task 1's threshold test only.

**One gap found and closed:** the spec lists "price_range có giá trị không hợp lệ" without saying whether `min > max` counts. Task 1 rejects it explicitly and tests it — an inverted range cannot produce a meaningful verdict.
