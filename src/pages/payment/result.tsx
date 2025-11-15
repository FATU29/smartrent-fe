import { useEffect } from 'react'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'

const PaymentResultPage: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return

    const { transactionRef, vnp_TxnRef, vnp_txnref, ...otherParams } =
      router.query
    const extractedRef = (transactionRef || vnp_TxnRef || vnp_txnref) as
      | string
      | undefined

    if (extractedRef) {
      const statusUrl = new URL('/payment/status', window.location.origin)
      statusUrl.searchParams.set('transactionRef', String(extractedRef))
      statusUrl.searchParams.set('vnp_TxnRef', String(extractedRef))

      Object.entries(otherParams).forEach(([key, value]) => {
        if (value && key !== 'returnUrl' && key !== 'auth') {
          statusUrl.searchParams.set(key, String(value))
        }
      })

      router.replace(statusUrl.pathname + statusUrl.search)
    } else {
      router.replace('/payment/status?error=missing_ref')
    }
  }, [router, router.isReady])

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
        <p className='text-muted-foreground'>Đang chuyển hướng...</p>
      </div>
    </div>
  )
}

export default PaymentResultPage
