import React, { useCallback } from 'react'
import dynamic from 'next/dynamic'
import ResidentialFilterBar from '../residentialFilterBar'

const ResidentialFilterDialog = dynamic(
  () => import('@/components/molecules/residentialFilterDialog'),
  {
    ssr: false,
  },
)

interface ResidentialFilterResponsiveProps {
  onApply?: () => void
  hideVerifiedFilterInDialog?: boolean
  hideViewMapInDialog?: boolean
}

const ResidentialFilterResponsive: React.FC<
  ResidentialFilterResponsiveProps
> = ({
  onApply,
  hideVerifiedFilterInDialog = false,
  hideViewMapInDialog = false,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const openDialog = useCallback(() => setDialogOpen(true), [])

  return (
    <div className='w-full'>
      <div className='flex flex-col w-full'>
        <div className='flex-1'>
          <ResidentialFilterBar onOpenAdvanced={openDialog} onApply={onApply} />
        </div>
      </div>
      <ResidentialFilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={undefined}
        onApply={onApply}
        hideVerifiedFilter={hideVerifiedFilterInDialog}
        hideViewMapButton={hideViewMapInDialog}
      />
    </div>
  )
}

export default ResidentialFilterResponsive
