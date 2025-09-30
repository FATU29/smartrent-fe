import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/atoms/tabs'
import PricingPlanCard, {
  PricingPlanCardSkeleton,
} from '@/components/molecules/pricingPlanCard'
import VoucherPackageCard, {
  VoucherPackageCardSkeleton,
} from '@/components/molecules/voucherPackageCard'
import {
  MEMBERSHIP_PLANS,
  VOUCHER_PACKAGES,
  getVoucherIcon,
} from '@/data/membership/data'
import { useTranslations } from 'next-intl'

const MembershipRegisterPage: NextPageWithLayout = () => {
  const loading = false // future: fetch state
  const tPage = useTranslations('membershipPage')
  const tPlans = useTranslations('membershipPlans')

  return (
    <>
      <SeoHead title={tPage('title') + ' – Sellernet'} noindex />
      <div className='flex flex-col gap-8'>
        <div className='relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-background/40 dark:from-background dark:via-background/60 dark:to-background/30 p-6'>
          <div className='pointer-events-none absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(circle_at_30%_20%,black,transparent_70%)] bg-[conic-gradient(at_20%_30%,hsl(var(--primary)/0.35),transparent_60%)]' />
          <div className='relative flex flex-col gap-3'>
            <h1 className='text-3xl font-semibold tracking-tight text-foreground'>
              {tPage('title')}
            </h1>
            <p className='text-sm text-muted-foreground max-w-2xl'>
              {tPage('subtitle')}
            </p>
          </div>
        </div>
        <Tabs
          defaultValue='membership'
          className='w-full'
          aria-label={tPage('aria.register')}
        >
          <TabsList className='flex-wrap rounded-lg border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40'>
            <TabsTrigger
              value='membership'
              aria-label={tPage('aria.membershipTab')}
              className='data-[state=active]:bg-primary/10'
            >
              {tPage('tabs.membership')}
            </TabsTrigger>
            <TabsTrigger
              value='voucher'
              aria-label={tPage('aria.voucherTab')}
              className='data-[state=active]:bg-primary/10'
            >
              {tPage('tabs.voucher')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='membership' className='mt-6'>
            {loading ? (
              <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
                <PricingPlanCardSkeleton />
                <PricingPlanCardSkeleton />
                <PricingPlanCardSkeleton />
              </div>
            ) : (
              <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
                {MEMBERSHIP_PLANS.map((plan) => {
                  // derive translated versions
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
                    features: g.features.map(
                      (f: {
                        label: string
                        active: boolean
                        hint?: string
                      }) => {
                        // map known feature labels to keys
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
                        return key
                          ? { ...f, label: tPlans(`features.${key}`) }
                          : f
                      },
                    ),
                  }))
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
                      onSelect={() => console.log('membership-select', plan.id)}
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value='voucher' className='mt-6'>
            {loading ? (
              <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
                <VoucherPackageCardSkeleton />
                <VoucherPackageCardSkeleton />
                <VoucherPackageCardSkeleton />
              </div>
            ) : (
              <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr'>
                {VOUCHER_PACKAGES.map((pkg) => (
                  <VoucherPackageCard
                    key={pkg.id}
                    voucherCount={pkg.voucherCount}
                    periodDays={pkg.periodDays}
                    price={pkg.price}
                    discountPercent={pkg.discountPercent}
                    savingAmountText={pkg.savingAmountText}
                    isBestSeller={pkg.bestSeller}
                    icon={getVoucherIcon(pkg.voucherCount)}
                    onSelect={() => console.log('voucher-select', pkg.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default MembershipRegisterPage

MembershipRegisterPage.getLayout = (page: React.ReactNode) => (
  <SellernetLayout>{page}</SellernetLayout>
)
