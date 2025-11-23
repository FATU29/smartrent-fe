export interface ExchangeRateResponse {
  base: string
  rates: Record<string, number>
  timestamp?: number
}

export interface ExchangeRate {
  vndPerUsd: number
  lastUpdated: number
}
