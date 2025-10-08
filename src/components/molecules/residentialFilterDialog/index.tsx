import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import { useTranslations } from 'next-intl'
import { ListFilters } from '@/contexts/list/index.type'
import MobileFilterHeader from '@/components/atoms/mobileFilter/header'
import MobileFilterActionBar from '@/components/atoms/mobileFilter/actionBar'
import MobileFilterMainView from '@/components/molecules/mobileFilter/mainView'
import RangeView from '@/components/molecules/mobileFilter/rangeView'
import SimpleListView from '@/components/molecules/mobileFilter/simpleListView'
import OrientationView from '@/components/molecules/mobileFilter/orientationView'
import AreaProjectView from '@/components/molecules/mobileFilter/areaProjectView'

// ResidentialFilterDialog
// Reusable full-screen (mobile) or centered (desktop) dialog hosting the multi-step filter views.
// Does not render its own trigger – parent controls open state.
interface ResidentialFilterDialogProps {
  value: ListFilters
  onChange: (filters: ListFilters) => void
  onClear: () => void
  onSearch?: (q: string) => void // optional (mobile variant uses it alongside search input)
  activeCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  searchValue?: string
}

type ViewKey =
  | 'main'
  | 'price'
  | 'area'
  | 'frontage'
  | 'moveInTime'
  | 'electricityPrice'
  | 'waterPrice'
  | 'internetPrice'
  | 'orientation'
  | 'areaProject'

const ResidentialFilterDialog: React.FC<ResidentialFilterDialogProps> = ({
  value,
  onChange,
  onClear,
  onSearch,
  // activeCount (not displayed inside dialog currently; parent may show badge on trigger)
  open,
  onOpenChange,
  title,
  searchValue,
}) => {
  const t = useTranslations('residentialFilter')
  const [view, setView] = useState<ViewKey>('main')

  const apply = () => {
    onChange(value)
    if (onSearch && searchValue !== undefined) onSearch(searchValue)
    onOpenChange(false)
  }

  const update = (partial: Partial<ListFilters>) => {
    onChange({ ...value, ...partial })
  }

  const resetAndStay = () => {
    onClear()
  }

  const closeDialog = () => {
    onOpenChange(false)
    setView('main')
  }

  const renderBody = () => {
    switch (view) {
      case 'price':
        return (
          <RangeView
            type='price'
            value={{ min: value.minPrice, max: value.maxPrice }}
            onChange={({ min, max }) =>
              update({ minPrice: min, maxPrice: max })
            }
            unit='VND'
          />
        )
      case 'area':
        return (
          <RangeView
            type='area'
            value={{ min: value.minArea, max: value.maxArea }}
            onChange={({ min, max }) => update({ minArea: min, maxArea: max })}
            unit='m²'
          />
        )
      case 'frontage':
        return (
          <RangeView
            type='frontage'
            value={{ min: value.minFrontage, max: value.maxFrontage }}
            onChange={({ min, max }) =>
              update({ minFrontage: min, maxFrontage: max })
            }
            unit='m'
          />
        )
      case 'moveInTime':
        return (
          <SimpleListView
            type='moveInTime'
            value={value.moveInTime}
            onChange={(v) => update({ moveInTime: v })}
          />
        )
      case 'electricityPrice':
        return (
          <SimpleListView
            type='electricityPrice'
            value={value.electricityPrice}
            onChange={(v) => update({ electricityPrice: v })}
          />
        )
      case 'waterPrice':
        return (
          <SimpleListView
            type='waterPrice'
            value={value.waterPrice}
            onChange={(v) => update({ waterPrice: v })}
          />
        )
      case 'internetPrice':
        return (
          <SimpleListView
            type='internetPrice'
            value={value.internetPrice}
            onChange={(v) => update({ internetPrice: v })}
          />
        )
      case 'orientation':
        return (
          <OrientationView
            value={value.orientation}
            onChange={(v) => update({ orientation: v })}
          />
        )
      case 'areaProject':
        return (
          <AreaProjectView
            value={value}
            onChange={(partial: Partial<ListFilters>) => update(partial)}
          />
        )
      default:
        return (
          <MobileFilterMainView
            filters={value}
            onNavigate={(v) => setView(v as ViewKey)}
            onUpdate={update}
          />
        )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (!o ? closeDialog() : onOpenChange(o))}
    >
      <DialogContent
        showCloseButton={false}
        className='h-dvh md:h-[90vh] max-w-none md:max-w-md rounded-none md:rounded-lg p-0 flex flex-col'
      >
        <MobileFilterHeader
          title={title || t('actions.filter')}
          onClose={closeDialog}
        />
        <div className='flex-1 overflow-y-auto'>{renderBody()}</div>
        <MobileFilterActionBar onReset={resetAndStay} onApply={apply} />
      </DialogContent>
    </Dialog>
  )
}

export default ResidentialFilterDialog
