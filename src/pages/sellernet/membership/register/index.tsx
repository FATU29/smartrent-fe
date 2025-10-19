'use server'
import React, { useMemo } from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import MembershipRegisterTemplate from '@/components/templates/membershipRegisterTemplate'
import { useTranslations } from 'next-intl'
import type { Membership } from '@/api/types/memembership.type'
import { MembershipService } from '@/api/services/membership.service'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'

interface MembershipRegisterPageProps {
  readonly memberships: Membership[]
  readonly error: string | null
}

const MembershipRegisterPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ memberships, error }) => {
  const tPage = useTranslations('membershipPage')

  const pageTitle = useMemo(() => `${tPage('title')} – Sellernet`, [tPage])

  return (
    <>
      <SeoHead title={pageTitle} />
      {error ? (
        <div className='flex items-center justify-center py-12'>
          <p className='text-destructive'>{error}</p>
        </div>
      ) : (
        <MembershipRegisterTemplate memberships={memberships} />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  MembershipRegisterPageProps
> = async (context) => {
  try {
    const { req } = context
    const cookieStore = req.headers.cookie
    const instance = createServerAxiosInstance(cookieStore)
    const response = await MembershipService.getAllPackages(instance)

    if (response.data) {
      return {
        props: {
          memberships: response.data,
          error: null,
        },
      }
    }

    return {
      props: {
        memberships: [],
        error: response.message || 'Failed to load membership packages',
      },
    }
  } catch (error) {
    console.error('Error fetching memberships:', error)
    return {
      props: {
        memberships: [],
        error: 'Failed to load membership packages',
      },
    }
  }
}

export default MembershipRegisterPage

MembershipRegisterPage.getLayout = (page: React.ReactNode) => (
  <SellernetLayout>{page}</SellernetLayout>
)
