import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import { useTranslations } from 'next-intl'
import { ListFilters } from '@/contexts/list/index.type'
import MobileFilterHeader from '@/components/atoms/mobileFilter/header'
import MobileFilterActionBar from '@/components/atoms/mobileFilter/actionBar'
import MobileFilterMainView from '@/components/molecules/mobileFilter/mainView'
import RangeView from '@/components/molecules/mobileFilter/rangeView'
import SimpleListView from '@/components/molecules/mobileFilter/simpleListView'
import OrientationView from '@/components/molecules/mobileFilter/orientationView'
import AmenitiesView from '@/components/molecules/mobileFilter/amenitiesView'
import AddressView from '@/components/molecules/mobileFilter/addressView'
import { AddressFilterData } from '@/components/molecules/filterAddress'

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
  onApply?: (filters: ListFilters) => void
}

type ViewKey =
  | 'main'
  | 'price'
  | 'area'
  | 'electricityPrice'
  | 'waterPrice'
  | 'internetPrice'
  | 'orientation'
  | 'amenities'
  | 'address'

const ResidentialFilterDialog: React.FC<ResidentialFilterDialogProps> = ({
  value,
  onChange,
  onClear,
  onSearch,
  open,
  onOpenChange,
  title,
  searchValue,
  onApply,
}) => {
  const t = useTranslations('residentialFilter')
  const [view, setView] = useState<ViewKey>('main')

  useEffect(() => {
    if (open) setView('main')
  }, [open])

  const apply = () => {
    if (onApply) {
      onApply(value)
      return
    }
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

  const backToParent = () => setView('main')

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
            value={value.orientation as string | undefined}
            onChange={(v: string | undefined) => update({ orientation: v })}
          />
        )
      case 'amenities':
        return (
          <AmenitiesView
            values={
              (value.amenities || []) as Array<{ id: number; name?: string }>
            }
            onChange={(v) =>
              update({ amenities: v as Array<{ id: number; name: string }> })
            }
          />
        )
      case 'address':
        return (
          <AddressView
            value={{
              province: value.province as string | undefined,
              district: value.district as string | undefined,
              ward: value.ward as string | undefined,
              newProvinceCode: value.newProvinceCode as string | undefined,
              newWardCode: value.newWardCode as string | undefined,
              addressStructureType: value.addressStructureType,
              searchAddress: value.searchAddress,
              addressEdited: value.addressEdited,
            }}
            onChange={(addressData: Partial<AddressFilterData>) =>
              update({
                province: addressData.province,
                district: addressData.district,
                ward: addressData.ward,
                newProvinceCode: addressData.newProvinceCode,
                newWardCode: addressData.newWardCode,
                addressStructureType: addressData.addressStructureType,
                searchAddress: addressData.searchAddress,
                addressEdited: addressData.addressEdited,
              })
            }
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
        className='size-full md:h-[90vh] max-w-none md:max-w-[500px] rounded-none md:rounded-lg p-0 flex flex-col'
      >
        <MobileFilterHeader
          title={title || t('actions.filter')}
          onClose={closeDialog}
        />
        <div className='flex-1 overflow-y-auto'>{renderBody()}</div>
        <MobileFilterActionBar
          onReset={view !== 'main' ? backToParent : resetAndStay}
          onApply={apply}
          resetLabel={view !== 'main' ? t('actions.back') : undefined}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ResidentialFilterDialog
