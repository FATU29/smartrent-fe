const VI_LABELS: Record<string, string> = {
  search_listings: 'Đang tìm bất động sản',
  get_listing_detail: 'Đang lấy chi tiết',
  get_price_estimate: 'Đang ước tính giá',
  get_price_history: 'Đang xem lịch sử giá',
  get_recommendations: 'Đang gợi ý',
  get_user_info: 'Đang lấy thông tin tài khoản',
  save_listing: 'Đang lưu tin',
}

const EN_LABELS: Record<string, string> = {
  search_listings: 'Searching listings',
  get_listing_detail: 'Loading details',
  get_price_estimate: 'Estimating price',
  get_price_history: 'Loading price history',
  get_recommendations: 'Building recommendations',
  get_user_info: 'Loading account info',
  save_listing: 'Saving listing',
}

export function getToolLabel(tool: string, locale: 'vi' | 'en'): string {
  const map = locale === 'vi' ? VI_LABELS : EN_LABELS
  return map[tool] ?? tool
}
