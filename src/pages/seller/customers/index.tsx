import type { NextPageWithLayout } from '@/types/next-page'
import SellerLayout from '@/components/layouts/sellerLayout/SellerLayout'
import SeoHead from '@/components/atoms/seo/SeoHead'
import CustomerManagementTemplate from '@/components/templates/customerManagementTemplate'
import type { GetServerSideProps } from 'next'
import { PhoneClickDetailService } from '@/api/services'
import { createServerAxiosInstance } from '@/configs/axios/axiosServer'
import { transformToCustomers } from '@/utils/phoneClickDetailTransform'
import type { Customer } from '@/api/types/customer.type'

interface CustomersPageProps {
  initialCustomers: Customer[]
}

const CustomersPage: NextPageWithLayout<CustomersPageProps> = ({
  initialCustomers,
}) => {
  return (
    <>
      <SeoHead title='Khách hàng – Seller' noindex />
      <div className='h-[calc(100vh-64px)]'>
        <CustomerManagementTemplate initialCustomers={initialCustomers} />
      </div>
    </>
  )
}

CustomersPage.getLayout = (page) => <SellerLayout>{page}</SellerLayout>

export default CustomersPage

export const getServerSideProps: GetServerSideProps<
  CustomersPageProps
> = async (context) => {
  try {
    const { req } = context
    const cookieStore = req.headers.cookie
    const instance = createServerAxiosInstance(cookieStore)

    // Only fetch customers data from server-side
    // Listings will be fetched client-side when user switches to listings tab
    const response = await PhoneClickDetailService.getMyListingsClicks(instance)

    if (!response.data || response.code !== '999999') {
      // Return empty data if API call fails
      return {
        props: {
          initialCustomers: [],
        },
      }
    }

    const phoneClicks = response.data || []

    // Transform to Customer format only
    const customers = transformToCustomers(phoneClicks)

    return {
      props: {
        initialCustomers: customers,
      },
    }
  } catch (error) {
    console.error('Error fetching customer data:', error)
    // Return empty data on error
    return {
      props: {
        initialCustomers: [],
      },
    }
  }
}
