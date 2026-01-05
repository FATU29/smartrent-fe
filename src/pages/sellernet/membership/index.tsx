import React, { useMemo } from 'react'
import type { NextPageWithLayout } from '@/types/next-page'
import SellernetLayout from '@/components/layouts/sellernet/SellernetLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuthContext } from '@/contexts/auth'
import { Card, CardContent, CardHeader } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { motion } from 'framer-motion'

const MembershipPage: NextPageWithLayout = () => {
  const tPage = useTranslations('membershipPage')
  const router = useRouter()
  const { user } = useAuthContext()

  const { data: membership, isLoading } = useMyMembership(user?.userId)

  const pageTitle = useMemo(() => `${tPage('title')} – Sellernet`, [tPage])

  const handleManageMembership = () => {
    router.push('/sellernet/membership/register')
  }

  if (isLoading) {
    return (
      <>
        <SeoHead title={pageTitle} />
        <div className='flex flex-col gap-8'>
          <Card>
            <CardContent className='p-6'>
              <Skeleton className='h-8 w-48 mb-4' />
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-3/4' />
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <SeoHead title={pageTitle} />
      <motion.div
        className='flex flex-col gap-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <Typography variant='h2'>{tPage('title')}</Typography>
          </CardHeader>
          <CardContent className='space-y-4'>
            {membership ? (
              <>
                <div className='space-y-2'>
                  <Typography variant='p'>
                    {tPage('currentPlan')}: {membership.packageName}
                  </Typography>
                  <Typography variant='p'>
                    {tPage('daysRemaining')}: {membership.daysRemaining}{' '}
                    {tPage('days')}
                  </Typography>
                </div>
                <Button onClick={handleManageMembership} size='lg'>
                  {tPage('upgradeButton')}
                </Button>
              </>
            ) : (
              <>
                <Typography variant='p'>{tPage('noMembership')}</Typography>
                <Button onClick={handleManageMembership} size='lg'>
                  {tPage('purchaseButton')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}

export default MembershipPage

MembershipPage.getLayout = (page: React.ReactNode) => (
  <SellernetLayout>{page}</SellernetLayout>
)
