import React from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import PricingGuideTemplate from '@/components/templates/pricingGuideTemplate'
import { MembershipService } from '@/api/services/membership.service'
import { VipTierService } from '@/api/services/vip-tier.service'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'
import type { Membership } from '@/api/types/membership.type'
import type { VipTier } from '@/api/types/vip-tier.type'

interface PricingGuidePageProps {
  readonly memberships: Membership[]
  readonly vipTiers: VipTier[]
  readonly error: string | null
}

const PricingGuidePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ memberships, vipTiers, error }) => {
  const t = useTranslations('guides.pricing')

  return (
    <>
      <SeoHead title={t('title')} description={t('description')} />
      {error ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-destructive'>{error}</p>
        </div>
      ) : (
        <PricingGuideTemplate memberships={memberships} vipTiers={vipTiers} />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  PricingGuidePageProps
> = async (context) => {
  try {
    const { req } = context
    const cookieStore = req.headers.cookie
    const instance = createServerAxiosInstance(cookieStore)

    const [membershipsResponse, vipTiersResponse] = await Promise.all([
      MembershipService.getAllPackages(instance),
      VipTierService.getActive(),
    ])

    if (membershipsResponse.data && vipTiersResponse.data) {
      return {
        props: {
          memberships: membershipsResponse.data || [],
          vipTiers: vipTiersResponse.data || [],
          error: null,
        },
      }
    }

    return {
      props: {
        memberships: [],
        vipTiers: [],
        error: 'Không thể tải dữ liệu',
      },
    }
  } catch (error) {
    console.error('Error fetching pricing data:', error)
    return {
      props: {
        memberships: [],
        vipTiers: [],
        error: 'Đã xảy ra lỗi khi tải dữ liệu',
      },
    }
  }
}

export default PricingGuidePage

PricingGuidePage.getLayout = (page: React.ReactNode) => (
  <SellernetLayout>{page}</SellernetLayout>
)
