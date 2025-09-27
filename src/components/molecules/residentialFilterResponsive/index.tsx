import React from 'react'
import ResidentialFilterBar from '@/components/molecules/residentialFilterBar'
import ResidentialFilterMobile from '@/components/molecules/residentialFilterMobile'
import ResidentialFilterDialog from '@/components/molecules/residentialFilterDialog'
import { ListFilters } from '@/contexts/list/index.type'
import { useListContext } from '@/contexts/list/useListContext'
import { useIsMobile } from '@/hooks/useMediaQuery'

const ResidentialFilterResponsive: React.FC = () => {
  const { filters, handleUpdateFilter, activeCount, handleResetFilter } =
    useListContext<unknown>()
  const isMobile = useIsMobile()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Mobile keeps its specialized integrated search+trigger component for now.
  if (isMobile) {
    return (
      <ResidentialFilterMobile
        value={filters}
        onChange={(f) => handleUpdateFilter(f as Partial<ListFilters>)}
        onSearch={(q) => handleUpdateFilter({ search: q })}
        activeCount={activeCount}
        onClear={() => handleResetFilter()}
      />
    )
  }

  // Desktop: show existing bar but replace its internal filter button via overlay using new dialog trigger.
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
        onClear={() => handleResetFilter()}
        activeCount={activeCount}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={undefined}
      />
    </div>
  )
}

export default ResidentialFilterResponsive
