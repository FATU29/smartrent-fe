import React, { useCallback } from 'react'
import ResidentialFilterDialog from '@/components/molecules/residentialFilterDialog'
import ResidentialFilterBar from '@/components/molecules/residentialFilterBar'

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
