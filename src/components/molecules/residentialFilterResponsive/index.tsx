import React from 'react'
import ResidentialFilterBar from '@/components/molecules/residentialFilterBar'
import ResidentialFilterDialog from '@/components/molecules/residentialFilterDialog'
import { ListFilters } from '@/contexts/list/index.type'
import { useListContext } from '@/contexts/list/useListContext'
import { useLocation } from '@/hooks/useLocation'

interface ResidentialFilterResponsiveProps {
  onApplyRef?: React.MutableRefObject<(() => void) | undefined>
}

const ResidentialFilterResponsive: React.FC<
  ResidentialFilterResponsiveProps
> = ({ onApplyRef }) => {
  const { filters, handleUpdateFilter, activeCount, handleResetFilter } =
    useListContext<unknown>()
  const { disableLocation } = useLocation()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const filterBarRef = React.useRef<{ triggerApply: () => void }>(null)

  // Expose apply function to parent
  React.useEffect(() => {
    if (onApplyRef) {
      onApplyRef.current = () => {
        filterBarRef.current?.triggerApply()
      }
    }
  }, [onApplyRef])

  const handleClear = () => {
    handleResetFilter()
    disableLocation()
  }

  return (
    <div className='w-full'>
      <div className='flex items-start w-full'>
        <ResidentialFilterBar
          ref={filterBarRef}
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
