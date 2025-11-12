import React from 'react'
import ResidentialFilterBar, {
  ResidentialFilterBarRef,
} from '@/components/molecules/residentialFilterBar'
import ResidentialFilterDialog from '@/components/molecules/residentialFilterDialog'
import { ListFilters } from '@/contexts/list/index.type'
import { useListContext } from '@/contexts/list/useListContext'
import { useLocation } from '@/hooks/useLocation'
import { countActiveFilters } from '@/utils/filters/countActiveFilters'

interface ResidentialFilterResponsiveProps {
  showClearButton?: boolean // default: true
  onClear?: () => void // if provided, enables clear button
}

const ResidentialFilterResponsive: React.FC<
  ResidentialFilterResponsiveProps
> = ({ showClearButton = true, onClear }) => {
  const { filters, handleUpdateFilter, activeCount, handleResetFilter } =
    useListContext<unknown>()
  const { disableLocation, isEnabled: isLocationEnabled } = useLocation()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const filterBarRef = React.useRef<ResidentialFilterBarRef | null>(null)
  const [pendingDraft, setPendingDraft] = React.useState<ListFilters | null>(
    filters as ListFilters,
  )
  const handlePendingChange = React.useCallback(
    (partial: Partial<ListFilters>) => {
      setPendingDraft((prev) => ({
        ...(prev || (filters as ListFilters)),
        ...partial,
      }))
    },
    [filters],
  )

  // Internal only – parent no longer triggers apply externally.

  const handleClear = () => {
    // Reset provider filters and location
    handleResetFilter()
    disableLocation()

    // Immediately reset pending draft so dialog/bar UI reflects cleared state
    const cleared: ListFilters = {
      search: '',
      perPage: filters.perPage,
      page: 1,
    } as ListFilters
    setPendingDraft(cleared)

    // Reset the bar's pending state via ref
    filterBarRef.current?.setPending({
      search: '',
      propertyType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minArea: undefined,
      maxArea: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      city: undefined,
      amenities: [],
      verified: false,
      professionalBroker: false,
      orientation: undefined,
      moveInTime: undefined,
      electricityPrice: undefined,
      waterPrice: undefined,
      internetPrice: undefined,
      minFrontage: undefined,
      maxFrontage: undefined,
      hasVideo: false,
      has360: false,
      province: undefined,
      district: undefined,
      ward: undefined,
      streetId: undefined,
      projectId: undefined,
      newProvinceCode: undefined,
      newWardCode: undefined,
      addressStructureType: undefined,
      searchAddress: undefined,
      addressEdited: undefined,
    })
  }

  const openDialogWithPending = () => {
    // Get current pending values from the filter bar
    const pending = filterBarRef.current?.getPending()
    setPendingDraft({ ...(filters as ListFilters), ...(pending || {}) })
    setDialogOpen(true)
  }

  const handleApplyFromDialog = (draft: ListFilters) => {
    // Update context filters first
    handleUpdateFilter(draft)

    // Set pending state in bar and trigger apply to push all params to URL
    filterBarRef.current?.setPending(draft)
    filterBarRef.current?.triggerApply()

    setDialogOpen(false)
  }

  const handleDialogChange = (f: ListFilters) => {
    setPendingDraft(f)
    filterBarRef.current?.setPending(f)
  }

  const handleClearButton = onClear || handleClear

  return (
    <div className='w-full'>
      <div className='flex flex-col w-full'>
        <div className='flex-1'>
          <ResidentialFilterBar
            ref={filterBarRef}
            onFiltersChange={(f) =>
              handleUpdateFilter(f as Partial<ListFilters>)
            }
            onSearch={(q) => handleUpdateFilter({ search: q })}
            onPendingChange={handlePendingChange}
            onClear={onClear || showClearButton ? handleClearButton : undefined}
            value={filters}
            activeCount={
              (pendingDraft ? countActiveFilters(pendingDraft) : activeCount) +
              (isLocationEnabled ? 1 : 0)
            }
            onOpenAdvanced={openDialogWithPending}
          />
        </div>
      </div>
      <ResidentialFilterDialog
        value={(pendingDraft as ListFilters) || (filters as ListFilters)}
        onChange={handleDialogChange}
        onClear={handleClearButton}
        activeCount={
          (pendingDraft ? countActiveFilters(pendingDraft) : activeCount) +
          (isLocationEnabled ? 1 : 0)
        }
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onApply={handleApplyFromDialog}
        title={undefined}
      />
    </div>
  )
}

export default ResidentialFilterResponsive
