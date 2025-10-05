// Filter content constants
export const POSTING_DATE_VALUES = {
  DEFAULT: 'default',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  CUSTOM: 'custom',
  CUSTOM_EDIT: 'custom_edit',
  CUSTOM_APPLIED: 'custom_applied',
} as const

export type PostingDateValue =
  (typeof POSTING_DATE_VALUES)[keyof typeof POSTING_DATE_VALUES]
