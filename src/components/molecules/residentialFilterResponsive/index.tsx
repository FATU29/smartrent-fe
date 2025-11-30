import React, { useCallback } from 'react'
import dynamic from 'next/dynamic'

const ResidentialFilterDialog = dynamic(
  () => import('@/components/molecules/residentialFilterDialog'),
  {
    ssr: false,
  },
)

const ResidentialFilterBar = dynamic(
  () => import('@/components/molecules/residentialFilterBar'),
  {
    ssr: false,
  },
)

interface ResidentialFilterResponsiveProps {
  onApply?: () => void // Custom apply handler (e.g., navigate from homepage to /properties)
}

const ResidentialFilterResponsive: React.FC<
  ResidentialFilterResponsiveProps
> = ({ onApply }) => {
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
      />
    </div>
  )
}

export default ResidentialFilterResponsive
