// Helper utilities for membership registration template
import { useTranslations } from 'next-intl'
import { MEMBERSHIP_PLANS, VOUCHER_PACKAGES } from '@/data/membership/data'

export const useFeatureGroupTranslation = () => {
  const tPlans = useTranslations('membershipPlans')

  const translateGroupTitle = (title?: string): string | undefined => {
    if (!title) return title

    if (title === 'Gói tin hằng tháng') {
      return tPlans('groups.monthlyPackage')
    }

    if (title === 'Tiện ích') {
      return tPlans('groups.utilities')
    }

    return title
  }

  return { translateGroupTitle }
}

export const useFeatureTranslation = () => {
  const tPlans = useTranslations('membershipPlans')

  const featureKeyMap: Record<string, string> = {
    'Tin VIP Vàng (hiển thị 7 ngày)': 'vipGold7',
    'Tin VIP Bạc (hiển thị 7 ngày)': 'vipSilver7',
    '1 Tin VIP Vàng (hiển thị 7 ngày)': '1vipGold7',
    '1 Tin VIP Bạc (hiển thị 7 ngày)': '1vipSilver7',
    '2 Tin VIP Bạc (hiển thị 7 ngày)': '2vipSilver7',
    '15 Tin Thường (hiển thị 10 ngày)': '15standard10',
    '30 Tin Thường (hiển thị 10 ngày)': '30standard10',
    '50 Tin Thường (hiển thị 10 ngày)': '50standard10',
    '15 lượt đẩy cho Tin Thường': '15pushStandard',
    '30 lượt đẩy cho Tin Thường': '30pushStandard',
    '50 lượt đẩy cho Tin Thường': '50pushStandard',
    'Bản quyền ảnh': 'imageCopyright',
    'Hẹn giờ đăng tin': 'scheduledPosting',
    'Báo cáo hiệu suất': 'performanceReport',
  }

  const translateFeature = (feature: {
    label: string
    active: boolean
    hint?: string
  }) => {
    const key = featureKeyMap[feature.label]
    return key ? { ...feature, label: tPlans(`features.${key}`) } : feature
  }

  return { translateFeature }
}

export const translateMembershipPlan = (
  plan: (typeof MEMBERSHIP_PLANS)[0],
  tPlans: ReturnType<typeof useTranslations>,
) => ({
  ...plan,
  name: tPlans(`${plan.id}.name`),
  description: tPlans(`${plan.id}.description`),
  savingAmountText: tPlans(`${plan.id}.savingAmountText`),
  // Keep original featureGroups as they already have proper structure
  featureGroups: plan.featureGroups,
})

export const translateVoucherPackage = (
  voucherPackage: (typeof VOUCHER_PACKAGES)[0],
  tVouchers: ReturnType<typeof useTranslations>,
) => ({
  ...voucherPackage,
  name: tVouchers(`${voucherPackage.id}.name`),
  description: tVouchers(`${voucherPackage.id}.description`),
  savingAmountText: tVouchers(`${voucherPackage.id}.savingAmountText`),
})
