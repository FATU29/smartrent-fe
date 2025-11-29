import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from '@/components/atoms/dialog'
import { useTranslations } from 'next-intl'
import { ListingFilterRequest } from '@/api/types'
import MobileFilterHeader from '@/components/atoms/mobileFilter/header'
import MobileFilterActionBar from '@/components/atoms/mobileFilter/actionBar'
import MobileFilterMainView from '@/components/molecules/mobileFilter/mainView'
import RangeView from '@/components/molecules/mobileFilter/rangeView'
import SimpleListView from '@/components/molecules/mobileFilter/simpleListView'
import OrientationView from '@/components/molecules/mobileFilter/orientationView'
import AmenitiesView from '@/components/molecules/mobileFilter/amenitiesView'
import PropertyTypeView from '@/components/molecules/mobileFilter/propertyTypeView'
import { useListContext } from '@/contexts/list/useListContext'
import AddressFilterView from '../mobileFilter/addressFilterView'
import { useRouter } from 'next/router'
import { pushQueryParams } from '@/utils/queryParams'
import { PUBLIC_ROUTES } from '@/constants/route'

interface ResidentialFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

type ViewKey =
  | 'main'
  | 'address'
  | 'propertyType'
  | 'price'
  | 'area'
  | 'bedroom'
  | 'electricityPrice'
  | 'waterPrice'
  | 'internetPrice'
  | 'serviceFee'
  | 'direction'
  | 'amenities'

const ResidentialFilterDialog: React.FC<ResidentialFilterDialogProps> = ({
  open,
  onOpenChange,
  title,
}) => {
  const t = useTranslations('residentialFilter')
  const router = useRouter()
  const { filters, updateFilters, resetFilters } = useListContext()
  const [view, setView] = useState<ViewKey>('main')
  const [draft, setDraft] = useState<ListingFilterRequest>(filters)

  useEffect(() => {
    if (open) {
      setView('main')
      setDraft(filters)
    }
  }, [open])

  const update = (partial: Partial<ListingFilterRequest>) => {
    setDraft((prev) => ({ ...prev, ...partial }) as ListingFilterRequest)
  }

  const apply = () => {
    updateFilters({ ...draft, page: 1 })

    const amenityIds = draft.amenityIds

    pushQueryParams(
      router,
      {
        categoryId: draft.categoryId ?? null,
        productType: draft.productType ?? null,
        keyword: draft.keyword || null,
        minPrice: draft.minPrice ?? null,
        maxPrice: draft.maxPrice ?? null,
        minArea: draft.minArea ?? null,
        maxArea: draft.maxArea ?? null,
        minBedrooms: draft.minBedrooms ?? null,
        maxBedrooms: draft.maxBedrooms ?? null,
        bathrooms: draft.bathrooms ?? null,
        verified: draft.verified || null,
        direction: draft.direction ?? null,
        electricityPrice: draft.electricityPrice ?? null,
        waterPrice: draft.waterPrice ?? null,
        internetPrice: draft.internetPrice ?? null,
        serviceFee: draft.serviceFee ?? null,
        amenityIds:
          amenityIds && amenityIds.length > 0 ? amenityIds.join(',') : null,
        provinceId: draft.provinceId ?? null,
        districtId: draft.districtId ?? null,
        wardId: draft.wardId ?? null,
        isLegacy: draft.isLegacy ?? null,
        latitude: draft.latitude ?? null,
        longitude: draft.longitude ?? null,
        sortBy: draft.sortBy ?? null,
        page: null,
      },
      {
        pathname: PUBLIC_ROUTES.PROPERTIES_PREFIX,
        shallow: false,
        scroll: true,
      },
    )

    onOpenChange(false)
  }

  const resetAndStay = () => {
    resetFilters()
    setDraft({ keyword: '', size: filters.size, page: 1 })
  }

  const backToParent = () => setView('main')

  const closeDialog = () => {
    onOpenChange(false)
    setView('main')
  }

  const renderBody = () => {
    switch (view) {
      case 'address':
        return <AddressFilterView value={draft} onChange={update} />
      case 'propertyType':
        return (
          <PropertyTypeView
            value={draft.productType}
            onChange={(v) => update({ productType: v })}
          />
        )
      case 'price':
        return (
          <RangeView
            type='price'
            value={{ min: draft.minPrice, max: draft.maxPrice }}
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
            value={{ min: draft.minArea, max: draft.maxArea }}
            onChange={({ min, max }) => update({ minArea: min, maxArea: max })}
            unit='m²'
          />
        )
      case 'bedroom':
        return (
          <RangeView
            type='bedroom'
            value={{ min: draft.minBedrooms, max: draft.maxBedrooms }}
            onChange={({ min, max }) =>
              update({ minBedrooms: min, maxBedrooms: max })
            }
            unit=''
          />
        )
      case 'electricityPrice':
        return (
          <SimpleListView
            type='electricityPrice'
            value={draft.electricityPrice}
            onChange={(v) => update({ electricityPrice: v })}
          />
        )
      case 'waterPrice':
        return (
          <SimpleListView
            type='waterPrice'
            value={draft.waterPrice}
            onChange={(v) => update({ waterPrice: v })}
          />
        )
      case 'internetPrice':
        return (
          <SimpleListView
            type='internetPrice'
            value={draft.internetPrice}
            onChange={(v) => update({ internetPrice: v })}
          />
        )
      case 'serviceFee':
        return (
          <SimpleListView
            type='serviceFee'
            value={draft.serviceFee}
            onChange={(v) => update({ serviceFee: v })}
          />
        )
      case 'direction':
        return (
          <OrientationView
            value={draft.direction}
            onChange={(v) => update({ direction: v })}
          />
        )
      case 'amenities':
        return (
          <AmenitiesView
            value={draft.amenityIds}
            onChange={(v) => update({ amenityIds: v })}
          />
        )
      default:
        return (
          <MobileFilterMainView
            filters={draft}
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
        <VisuallyHidden>
          <DialogTitle>{title || t('actions.filter')}</DialogTitle>
        </VisuallyHidden>
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
