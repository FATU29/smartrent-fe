import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import dynamic from 'next/dynamic'
import type { SePayInitiationData } from '@/api/types/payment.type'

const SePayCheckoutDialog = dynamic(
  () => import('@/components/molecules/sepayCheckoutDialog'),
  { ssr: false, loading: () => null },
)

interface SePayCheckoutOptions {
  /** Runs once when the transfer is confirmed COMPLETED. */
  onCompleted?: () => void
}

interface SePayCheckoutContextType {
  /** Show the VietQR checkout dialog and start polling for the transfer. */
  openSePayCheckout: (
    data: SePayInitiationData,
    options?: SePayCheckoutOptions,
  ) => void
  closeSePayCheckout: () => void
}

const SePayCheckoutContext = createContext<
  SePayCheckoutContextType | undefined
>(undefined)

/**
 * App-wide host for the SePay (VietQR) checkout. Any flow that initiates a
 * SePay payment calls `openSePayCheckout(data)` instead of redirecting — SePay
 * confirms via webhook, so the dialog renders the QR and polls until paid.
 */
export const SePayCheckoutProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<SePayInitiationData | null>(null)
  const onCompletedRef = useRef<(() => void) | undefined>(undefined)

  const openSePayCheckout = useCallback(
    (next: SePayInitiationData, options?: SePayCheckoutOptions) => {
      onCompletedRef.current = options?.onCompleted
      setData(next)
      setOpen(true)
    },
    [],
  )

  const closeSePayCheckout = useCallback(() => {
    setOpen(false)
  }, [])

  const handleCompleted = useCallback(() => {
    onCompletedRef.current?.()
  }, [])

  const value = useMemo(
    () => ({ openSePayCheckout, closeSePayCheckout }),
    [openSePayCheckout, closeSePayCheckout],
  )

  return (
    <SePayCheckoutContext.Provider value={value}>
      {children}
      <SePayCheckoutDialog
        open={open}
        onOpenChange={setOpen}
        data={data}
        onCompleted={handleCompleted}
      />
    </SePayCheckoutContext.Provider>
  )
}

export const useSePayCheckout = (): SePayCheckoutContextType => {
  const ctx = useContext(SePayCheckoutContext)
  if (!ctx) {
    throw new Error(
      'useSePayCheckout must be used within a SePayCheckoutProvider',
    )
  }
  return ctx
}

export default SePayCheckoutProvider
