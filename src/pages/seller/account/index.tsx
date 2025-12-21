import { useEffect } from 'react'
import { useRouter } from 'next/router'
import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import { SELLERNET_ROUTES } from '@/constants/route'

const AccountPage: NextPageWithLayout = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace(SELLERNET_ROUTES.PERSONAL_EDIT)
  }, [router])

  return null
}

AccountPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default AccountPage
