import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import SearchInput from '@/components/molecules/searchInput'
import { Button } from '@/components/atoms/button'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import { Filter } from 'lucide-react'
import { ListFilters } from '@/contexts/list/index.type'
import MobileFilterHeader from '@/components/atoms/mobileFilter/header'
import MobileFilterActionBar from '@/components/atoms/mobileFilter/actionBar'
import MobileFilterMainView from '@/components/molecules/mobileFilter/mainView'
import RangeView from '@/components/molecules/mobileFilter/rangeView'
import SimpleListView from '@/components/molecules/mobileFilter/simpleListView'
import OrientationView from '@/components/molecules/mobileFilter/orientationView'
import AreaProjectView from '@/components/molecules/mobileFilter/areaProjectView'

interface ResidentialFilterMobileProps {
  value: ListFilters
  onChange: (filters: ListFilters) => void
  onSearch: (q: string) => void
  activeCount: number
  onClear: () => void
}

const ResidentialFilterMobile: React.FC<ResidentialFilterMobileProps> = ({
  value,
  onChange,
  onSearch,
  activeCount,
  onClear,
}) => {
  const t = useTranslations('residentialFilter')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value.search || '')
  const [view, setView] = useState<
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
  >('main')

  const apply = () => {
    onChange(value)
    onSearch(search)
    setOpen(false)
  }

  const update = (partial: Partial<ListFilters>) => {
    onChange({ ...value, ...partial })
  }

  const resetAndStay = () => {
    onClear()
  }

  const closeDialog = () => {
    setOpen(false)
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
            onNavigate={(v) =>
              setView(
                v as
                  | 'main'
                  | 'price'
                  | 'area'
                  | 'frontage'
                  | 'moveInTime'
                  | 'electricityPrice'
                  | 'waterPrice'
                  | 'internetPrice'
                  | 'orientation',
              )
            }
            onUpdate={update}
          />
        )
    }
  }

  return (
    <div className='space-y-3 md:hidden'>
      <div className='flex gap-2'>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('searchPlaceholder')}
          className='flex-1'
        />
        <Button
          variant='outline'
          className='h-9 px-3 relative'
          onClick={() => setOpen(true)}
        >
          <Filter className='h-4 w-4' />
          {activeCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-destructive text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full'>
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => (!o ? closeDialog() : setOpen(o))}
      >
        <DialogContent
          showCloseButton={false}
          className='h-dvh max-w-none rounded-none p-0 flex flex-col'
        >
          <MobileFilterHeader
            title={t('actions.filter')}
            onClose={closeDialog}
          />
          <div className='flex-1 overflow-y-auto'>{renderBody()}</div>
          <MobileFilterActionBar onReset={resetAndStay} onApply={apply} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ResidentialFilterMobile
