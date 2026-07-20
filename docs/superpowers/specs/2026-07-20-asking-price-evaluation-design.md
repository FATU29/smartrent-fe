# Đánh giá giá chào bán trong bước AI valuation

**Ngày:** 2026-07-20
**Repo ảnh hưởng:** smartrent-fe (duy nhất)

## Bối cảnh

Bước "Đánh giá giá AI" (step 1 của wizard đăng bài) hiện chỉ hiển thị khoảng giá
AI đề xuất — min / trung bình / max — kèm bằng chứng (`listings_found`,
`confidence`, cảnh báo fallback) vừa được thêm ở smartrent-fe#465.

Nhưng nó chưa bao giờ **đánh giá giá mà user đang đặt**. Bước này tên là "đánh
giá giá" trong khi thực tế chỉ gợi ý khoảng giá; user phải tự nhẩm xem giá mình
nhập có nằm trong khoảng đó không.

`propertyInfo.price` được nhập ở **step 0**, trước bước định giá, nên dữ liệu đã
có sẵn trong context khi `AIValuationSection` mount. Không cần plumbing mới.

Logic so sánh giá-với-thị trường có tồn tại trong smartrent-ai
(`evaluate_price_vs_market`) nhưng nằm trong file XGBoost không reachable từ
luồng đăng bài, và đã có quyết định không nối XGBoost vào.

## Mục tiêu

Cho user biết giá họ đang đặt nằm ở đâu so với khoảng AI đề xuất, và lệch bao
nhiêu phần trăm.

## Phi mục tiêu

- **Không chặn** việc đăng bài hay chuyển step. Chỉ thông báo.
- **Không gọi AI.** Không gửi `askingPrice` lên, không sửa smartrent-ai hay
  smartrent-backend.
- **Không thêm ô sửa giá tại chỗ.** Ô giá ở bước này vẫn là read-only echo từ
  step 0 như hiện tại.
- Không nối XGBoost.

## Quyết định thiết kế

| Quyết định | Chọn | Lý do |
|---|---|---|
| Tính ở đâu | FE thuần | Một repo, tức thì, deterministic nên test được đầy đủ, không tốn token LLM |
| Mức độ | Chỉ thông báo | Khoảng giá AI vẫn có lúc yếu; chặn user dựa trên số liệu yếu gây ức chế |
| Ngưỡng | Dựa trên khoảng min–max | Độ rộng khoảng đã phản ánh độ không chắc chắn — khoảng rộng thì tự động khoan dung hơn |
| Khi dữ liệu yếu | Ẩn đánh giá | Nói "giá bạn cao hơn 40%" dựa trên bảng hardcode là sai, đi ngược lại chính #89/#465 |

## Kiến trúc

### Hàm thuần `evaluateAskingPrice`

File mới: `src/utils/ai/priceEvaluation.ts`

Tách riêng khỏi `housingPredictor.ts` — file đó đã lo phân giải địa chỉ và dựng
request; thêm logic đánh giá vào sẽ làm nó gánh hai việc không liên quan.

```ts
export type PriceVerdict = 'below' | 'fair' | 'above'
export type PriceSeverity = 'mild' | 'strong'

export interface PriceEvaluation {
  verdict: PriceVerdict
  /** null khi verdict === 'fair' */
  severity: PriceSeverity | null
  /** % lệch so với biên gần nhất; 0 khi nằm trong khoảng */
  differencePercent: number
  /** giá theo tháng (VND) thực sự được đem so sánh */
  normalizedMonthlyPrice: number
}

export const evaluateAskingPrice = (
  price: number | undefined,
  priceUnit: PriceUnit | undefined,
  prediction: HousingPredictorResponse | null,
): PriceEvaluation | null
```

### Điều kiện trả `null`

Trả `null` (UI không render gì) khi bất kỳ điều nào đúng:

1. `price` không phải số hữu hạn, hoặc `<= 0`
2. `prediction` là `null`
3. `prediction.price_range.min`/`max` không phải số hữu hạn dương
4. `prediction.source === 'rule_based_fallback'`
5. `prediction.listings_found === 0`
6. `priceUnit` không phải `'MONTH'` hoặc `'YEAR'`

**Về (4) và (5):** chỉ ẩn khi có **bằng chứng dương** rằng dữ liệu yếu. Nếu
`source` hoặc `listings_found` là `undefined` thì **vẫn đánh giá** — thiếu thông
tin không đồng nghĩa với fallback. Nếu bắt buộc phải có mặt, tính năng sẽ im lặng
biến mất khi field vắng vì bất kỳ lý do gì.

**Về (6):** `PriceUnit` khai báo `'MONTH' | 'YEAR' | 'DAY'` nhưng
`validationSchemas.ts` chỉ cho phép `MONTH`/`YEAR`, nên `DAY` không tới được qua
wizard. Xử lý bằng cách trả `null` thay vì đoán hệ số quy đổi — thà không đánh
giá còn hơn so lệch 30 lần.

### Quy đổi đơn vị

AI luôn trả về **giá thuê theo tháng**. Giá user thì theo `priceUnit`.

```
MONTH → normalizedMonthlyPrice = price
YEAR  → normalizedMonthlyPrice = price / 12
```

Mọi so sánh chạy trên `normalizedMonthlyPrice`. Phần **hiển thị** vẫn dùng giá
gốc theo đúng đơn vị user chọn, để không gây bối rối.

### Ngưỡng phân loại

Đặt `p = normalizedMonthlyPrice`, `min`/`max` từ `price_range`.

| Điều kiện | verdict | severity | differencePercent |
|---|---|---|---|
| `min ≤ p ≤ max` | `fair` | `null` | `0` |
| `p < min`, lệch ≤ 25% | `below` | `mild` | `(min - p) / min × 100` |
| `p < min`, lệch > 25% | `below` | `strong` | như trên |
| `p > max`, lệch ≤ 25% | `above` | `mild` | `(p - max) / max × 100` |
| `p > max`, lệch > 25% | `above` | `strong` | như trên |

Biên là **inclusive** — `p === min` và `p === max` đều là `fair`.

`differencePercent` trả ra đã làm tròn tới 1 chữ số thập phân. Nhưng việc **phân
loại `mild` / `strong` so trên giá trị thô chưa làm tròn** — nếu không, lệch
25.04% sẽ làm tròn thành 25.0 rồi bị xếp nhầm thành `mild`.

Ngưỡng `25%` khai báo thành hằng số có tên (`STRONG_DEVIATION_PERCENT`) để dễ
chỉnh sau.

## UI

Chèn vào `src/components/organisms/createPostSections/aiValuationSection.tsx`,
trong khối `{prediction && (...)}`, **ngay dưới** dòng bằng chứng
(`listings_found` / `confidence`) đã có từ #465.

Nội dung:
- Giá user đang đặt, định dạng qua `formatByLocale`, kèm nhãn đơn vị
- Badge phân loại
- Một dòng giải thích mức lệch

Bảng màu — dùng lại đúng palette đang có trong file:

| Trạng thái | Màu |
|---|---|
| `fair` | xanh lá (`green-600` / `green-400` dark) |
| `mild` (cao hoặc thấp) | amber |
| `strong` (quá cao hoặc quá thấp) | đỏ |

Khi `evaluateAskingPrice` trả `null` thì không render gì cả — không có
placeholder, không có dòng "chưa đánh giá được".

## i18n

Keys mới dưới `createPost.sections.aiValuation.results.priceEvaluation`:

```
yourPrice          "Giá bạn đang đặt"
fair               "Hợp lý"
below              "Thấp hơn thị trường"
belowStrong        "Thấp hơn thị trường đáng kể"
above              "Cao hơn thị trường"
aboveStrong        "Cao hơn thị trường đáng kể"
inRange            "Nằm trong khoảng AI đề xuất"
deviationAbove     "Cao hơn khoảng đề xuất {percent}%"
deviationBelow     "Thấp hơn khoảng đề xuất {percent}%"
```

Thêm cho cả `vi.json` và `en.json`. Có placeholder `{percent}` nên phải qua được
`pnpm i18n:check` (script này so khớp placeholder giữa hai file).

## Testing

File mới: `src/utils/ai/priceEvaluation.test.ts` (vitest).

Các case bắt buộc:

- Nằm trong khoảng → `fair`, `differencePercent === 0`
- Đúng biên `min` và đúng biên `max` → `fair` (kiểm tra inclusive)
- Trên `max` 10% → `above` / `mild`
- Trên `max` 50% → `above` / `strong`
- Dưới `min` 10% → `below` / `mild`
- Dưới `min` 50% → `below` / `strong`
- Đúng ngưỡng 25% → `mild` (kiểm tra biên của severity)
- Lệch 25.04% → `strong` (chứng minh phân loại so trên giá trị thô, không so
  trên số đã làm tròn)
- `priceUnit: 'YEAR'` → quy đổi /12 rồi mới so
- `price` undefined / 0 / âm / NaN → `null`
- `prediction` null → `null`
- `source: 'rule_based_fallback'` → `null`
- `listings_found: 0` → `null`
- `source`/`listings_found` undefined → **vẫn đánh giá**
- `priceUnit: 'DAY'` hoặc undefined → `null`
- `price_range` có giá trị không hợp lệ (0, âm, NaN) → `null`

## Xử lý lỗi

Hàm thuần, không ném lỗi, không side effect. Mọi input không dùng được đều trả
`null`. UI chỉ cần kiểm tra `null`.

## Ảnh hưởng tới luồng sửa bài

`aiValuationSection.tsx` được dùng chung: `createPostTemplate/AIValuationStep.tsx`
và `updatePostTemplate/AIValuationStep.tsx` đều render đúng component này. Thay
đổi sẽ xuất hiện ở cả hai luồng cùng lúc.

Đã kiểm chứng luồng sửa bài an toàn:
- `mapListingToFormData.ts:165-166` có hydrate `price` và `priceUnit` từ listing
- `pages/seller/update-post/[id].tsx:179` có mount `CreatePostProvider`

## Rủi ro đã biết

**Khoảng giá quá hẹp.** Nếu agent trả về khoảng rất hẹp (ví dụ 6.0M–6.2M) thì
gần như mọi giá đều rơi ra ngoài. Chấp nhận ở bản này: đây là thông báo chứ không
chặn, và độ hẹp của khoảng là tín hiệu từ chính AI. Nếu thực tế cho thấy khó chịu
thì xử lý sau bằng cách áp sàn độ rộng tối thiểu.

**Ngưỡng 25% là phỏng đoán.** Chưa có dữ liệu thực nghiệm. Khai báo thành hằng số
có tên để chỉnh nhanh khi có phản hồi.

## Bước sau (không nằm trong phạm vi)

- Đổi ô giá read-only ở bước này thành input để user sửa và thấy đánh giá cập
  nhật ngay — hàm thuần đã sẵn sàng cho việc đó
- Đưa đánh giá lên ngay cạnh ô nhập giá ở step 0 (cần prefetch prediction sớm hơn)
- Cache / rate limit endpoint định giá — mỗi lần mount step vẫn là một agent run
  tới 12 turn
