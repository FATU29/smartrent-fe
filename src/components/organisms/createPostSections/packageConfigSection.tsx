import React from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import PricingPlanCard from '@/components/molecules/pricingPlanCard'
import VoucherPackageCard from '@/components/molecules/voucherPackageCard'
import {
  MEMBERSHIP_PLANS,
  VOUCHER_PACKAGES,
  getVoucherIcon,
} from '@/data/membership/data'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/tabs'

interface PackageConfigSectionProps {
  className?: string
}

const PackageConfigSection: React.FC<PackageConfigSectionProps> = ({
  className,
}) => {
  const tPage = useTranslations('membershipPage')
  const tPlans = useTranslations('membershipPlans')
  const tCreatePost = useTranslations('createPost.sections.packageConfig')
  const { propertyInfo, updatePropertyInfo } = useCreatePost()

  return (
    <div className={className}>
      <div className='mb-6 sm:mb-8'>
        <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3'>
          {tCreatePost('title')}
        </h2>
        <p className='text-sm sm:text-base text-muted-foreground'>
          {tCreatePost('description')}
        </p>
      </div>
      <Tabs defaultValue='membership' className='w-full'>
        <TabsList className='flex-wrap rounded-lg border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40'>
          <TabsTrigger
            value='membership'
            className='data-[state=active]:bg-primary/10'
          >
            {tPage('tabs.membership')}
          </TabsTrigger>
          <TabsTrigger
            value='voucher'
            className='data-[state=active]:bg-primary/10'
          >
            {tPage('tabs.voucher')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value='membership' className='mt-6'>
          <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
            {MEMBERSHIP_PLANS.map((plan) => {
              const name = tPlans(`${plan.id}.name`)
              const description = tPlans(`${plan.id}.description`)
              const groups = plan.featureGroups.map((g) => ({
                ...g,
                title:
                  g.title === 'Gói tin hằng tháng'
                    ? tPlans('groups.monthlyPackage')
                    : g.title === 'Tiện ích'
                      ? tPlans('groups.utilities')
                      : g.title,
                features: g.features.map((f) => {
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
                  const key = featureKeyMap[f.label]
                  return key ? { ...f, label: tPlans(`features.${key}`) } : f
                }),
              }))
              const selected = propertyInfo.selectedMembershipPlanId === plan.id
              return (
                <PricingPlanCard
                  key={plan.id}
                  name={name}
                  description={description}
                  price={plan.price}
                  discountPercent={plan.discountPercent}
                  savingAmountText={plan.savingAmountText?.replace(
                    'mỗi tháng',
                    tPlans('savingSuffix'),
                  )}
                  featureGroups={groups}
                  isBestSeller={plan.bestSeller}
                  icon={plan.icon}
                  selected={selected}
                  compact
                  onSelect={() =>
                    updatePropertyInfo({ selectedMembershipPlanId: plan.id })
                  }
                />
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value='voucher' className='mt-6'>
          <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
            {VOUCHER_PACKAGES.map((pkg) => {
              const selected = propertyInfo.selectedVoucherPackageId === pkg.id
              return (
                <VoucherPackageCard
                  key={pkg.id}
                  voucherCount={pkg.voucherCount}
                  periodDays={pkg.periodDays}
                  price={pkg.price}
                  discountPercent={pkg.discountPercent}
                  savingAmountText={pkg.savingAmountText}
                  isBestSeller={pkg.bestSeller}
                  icon={getVoucherIcon(pkg.voucherCount)}
                  selected={selected}
                  onSelect={() =>
                    updatePropertyInfo({ selectedVoucherPackageId: pkg.id })
                  }
                />
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { PackageConfigSection }
export type { PackageConfigSectionProps }
