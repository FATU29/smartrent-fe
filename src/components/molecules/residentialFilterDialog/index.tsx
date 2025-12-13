import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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
import { navigateToPropertiesWithFilters } from '@/utils/filters'
import useLocation from '@/hooks/useLocation'

interface ResidentialFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  onApply?: () => void
  hideLocationFilter?: boolean
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
  onApply: onApplyProp,
  hideLocationFilter = false,
}) => {
  const t = useTranslations('residentialFilter')
  const router = useRouter()
  const { filters, updateFilters, resetFilters } = useListContext()
  const { disableLocation } = useLocation()

  // State
  const [view, setView] = useState<ViewKey>('main')
  const [draft, setDraft] = useState<ListingFilterRequest>(filters)

  // Refs for stable values
  const filtersRef = useRef(filters)
  const prevOpenRef = useRef(open)

  // Keep filters ref in sync
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Sync draft when dialog opens, reset view when closes
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraft(filtersRef.current)
    }
    if (!open) {
      setView('main')
    }
    prevOpenRef.current = open
  }, [open])

  // Handlers
  const update = useCallback((partial: Partial<ListingFilterRequest>) => {
    setDraft((prev) => ({ ...prev, ...partial }))
  }, [])

  const apply = useCallback(() => {
    updateFilters({ ...draft, page: 1 })

    if (onApplyProp) {
      onApplyProp()
      onOpenChange(false)
      return
    }

    if (router.isReady) {
      navigateToPropertiesWithFilters(router, draft)
    }
    onOpenChange(false)
  }, [draft, updateFilters, onApplyProp, router, onOpenChange])

  const resetAndStay = useCallback(() => {
    resetFilters()
    disableLocation()
    setDraft((prev) => ({
      ...prev,
      keyword: '',
      page: 1,
      userLatitude: undefined,
      userLongitude: undefined,
    }))
  }, [resetFilters, disableLocation])

  const backToParent = useCallback(() => setView('main'), [])

  const closeDialog = useCallback(() => onOpenChange(false), [onOpenChange])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        closeDialog()
      } else {
        onOpenChange(newOpen)
      }
    },
    [closeDialog, onOpenChange],
  )

  // Render view content
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
            hideLocationFilter={hideLocationFilter}
          />
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='size-full md:h-[90vh] max-w-none md:max-w-[500px] rounded-none md:rounded-lg p-0 flex flex-col'
      >
        <VisuallyHidden>
          <DialogTitle>{title || t('actions.filter')}</DialogTitle>
          <DialogDescription>
            {t('actions.filter') || 'Filter residential properties'}
          </DialogDescription>
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
