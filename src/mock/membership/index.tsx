import React from 'react'
import { Leaf, Sparkles, Crown, TicketPercent, Gift } from 'lucide-react'

export interface PricingPlanFeature {
  label: string
  active: boolean
  hint?: string
}
export interface PricingPlanFeatureGroup {
  title?: string
  features: PricingPlanFeature[]
}
export interface MembershipPlan {
  id: string
  name: string
  description?: string
  price: number
  discountPercent?: number
  savingAmountText?: string
  featureGroups: PricingPlanFeatureGroup[]
  bestSeller?: boolean
  icon?: React.ReactNode
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'basic',
    name: 'Hội viên Cơ bản',
    description: 'Phù hợp với môi giới mới hoặc gói hàng nhỏ',
    price: 517000,
    discountPercent: 32,
    savingAmountText: '243.000 đ mỗi tháng',
    icon: (
      <span className='inline-flex items-center justify-center rounded-full bg-primary/10 text-primary size-12'>
        <Leaf className='size-6' />
      </span>
    ),
    featureGroups: [
      {
        title: 'Gói tin hằng tháng',
        features: [
          { label: 'Tin VIP Vàng (hiển thị 7 ngày)', active: false },
          { label: 'Tin VIP Bạc (hiển thị 7 ngày)', active: false },
          { label: '15 Tin Thường (hiển thị 10 ngày)', active: true },
          { label: '15 lượt đẩy cho Tin Thường', active: true },
        ],
      },
      {
        title: 'Tiện ích',
        features: [
          { label: 'Bản quyền ảnh', active: false },
          { label: 'Hẹn giờ đăng tin', active: false },
          { label: 'Báo cáo hiệu suất', active: false },
        ],
      },
    ],
  },
  {
    id: 'standard',
    name: 'Hội viên Tiêu chuẩn',
    description: 'Phù hợp với môi giới chuyên nghiệp có gói hàng từ 10 BDS',
    price: 1383000,
    discountPercent: 34,
    savingAmountText: '729.000 đ mỗi tháng',
    bestSeller: true,
    icon: (
      <span className='inline-flex items-center justify-center rounded-full bg-primary/15 text-primary size-12 shadow-inner'>
        <Sparkles className='size-6' />
      </span>
    ),
    featureGroups: [
      {
        title: 'Gói tin hằng tháng',
        features: [
          { label: 'Tin VIP Vàng (hiển thị 7 ngày)', active: false },
          { label: '1 Tin VIP Bạc (hiển thị 7 ngày)', active: true },
          { label: '30 Tin Thường (hiển thị 10 ngày)', active: true },
          { label: '30 lượt đẩy cho Tin Thường', active: true },
        ],
      },
      {
        title: 'Tiện ích',
        features: [
          { label: 'Bản quyền ảnh', active: true },
          { label: 'Hẹn giờ đăng tin', active: true },
          { label: 'Báo cáo hiệu suất', active: true },
        ],
      },
    ],
  },
  {
    id: 'premium',
    name: 'Hội viên Cao cấp',
    description: 'Phù hợp với môi giới có gói hàng và ngân sách quảng cáo lớn',
    price: 2833000,
    discountPercent: 39,
    savingAmountText: '1.812.000 đ mỗi tháng',
    icon: (
      <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary size-12 ring-1 ring-primary/30'>
        <Crown className='size-6' />
      </span>
    ),
    featureGroups: [
      {
        title: 'Gói tin hằng tháng',
        features: [
          { label: '1 Tin VIP Vàng (hiển thị 7 ngày)', active: true },
          { label: '2 Tin VIP Bạc (hiển thị 7 ngày)', active: true },
          { label: '50 Tin Thường (hiển thị 10 ngày)', active: true },
          { label: '50 lượt đẩy cho Tin Thường', active: true },
        ],
      },
      {
        title: 'Tiện ích',
        features: [
          { label: 'Bản quyền ảnh', active: true },
          { label: 'Hẹn giờ đăng tin', active: true },
          { label: 'Báo cáo hiệu suất', active: true },
        ],
      },
    ],
  },
]

export interface VoucherPackage {
  id: string
  voucherCount: number
  periodDays: number
  price: number
  discountPercent?: number
  savingAmountText?: string
  bestSeller?: boolean
}

export const VOUCHER_PACKAGES: VoucherPackage[] = [
  {
    id: 'voucher-30',
    voucherCount: 30,
    periodDays: 30,
    price: 240000,
    discountPercent: 20,
    savingAmountText: '60.000 đ',
  },
  {
    id: 'voucher-50',
    voucherCount: 50,
    periodDays: 30,
    price: 375000,
    discountPercent: 25,
    savingAmountText: '125.000 đ',
    bestSeller: true,
  },
  {
    id: 'voucher-100',
    voucherCount: 100,
    periodDays: 30,
    price: 700000,
    discountPercent: 30,
    savingAmountText: '300.000 đ',
  },
]

export function getVoucherIcon(count: number): React.ReactNode {
  if (count >= 100) return <Sparkles className='size-6 text-primary' />
  if (count >= 50) return <Gift className='size-6 text-primary' />
  return <TicketPercent className='size-6 text-primary' />
}
