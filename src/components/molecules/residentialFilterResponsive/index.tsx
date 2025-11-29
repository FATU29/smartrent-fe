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

const ResidentialFilterResponsive: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const openDialog = useCallback(() => setDialogOpen(true), [])

  return (
    <div className='w-full'>
      <div className='flex flex-col w-full'>
        <div className='flex-1'>
          <ResidentialFilterBar onOpenAdvanced={openDialog} />
        </div>
      </div>
      <ResidentialFilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={undefined}
      />
    </div>
  )
}

export default ResidentialFilterResponsive
