import React from 'react'
import ResidentialFilterBar from '@/components/molecules/residentialFilterBar'
import ResidentialFilterDialog from '@/components/molecules/residentialFilterDialog'
import { ListFilters } from '@/contexts/list/index.type'
import { useListContext } from '@/contexts/list/useListContext'
import { useLocation } from '@/hooks/useLocation'

const ResidentialFilterResponsive: React.FC = () => {
  const { filters, handleUpdateFilter, activeCount, handleResetFilter } =
    useListContext<unknown>()
  const { disableLocation } = useLocation()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const handleClear = () => {
    handleResetFilter()
    disableLocation()
  }

  return (
    <div className='w-full'>
      <div className='flex items-start w-full'>
        <ResidentialFilterBar
          onFiltersChange={(f) => handleUpdateFilter(f as Partial<ListFilters>)}
          onSearch={(q) => handleUpdateFilter({ search: q })}
          value={filters}
          activeCount={activeCount}
          onOpenAdvanced={() => setDialogOpen(true)}
        />
      </div>
      <ResidentialFilterDialog
        value={filters}
        onChange={(f) => handleUpdateFilter(f as Partial<ListFilters>)}
        onClear={handleClear}
        activeCount={activeCount}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={undefined}
      />
    </div>
  )
}

export default ResidentialFilterResponsive
