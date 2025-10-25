import React from 'react'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/atoms/checkbox'
import { SearchInput } from '@/components/atoms/search-input'
import { Typography } from '@/components/atoms/typography'
import {
  findDistrictByCode,
  getWardsByDistrictCode,
  getDistrictsByProvinceCode,
  findProvinceByCode,
} from '@/constants'

export interface WardSelectionDialogProps {
  selectedDistrictCodes: string[]
  selectedProvinceCode?: string // For direct province->ward selection
  wardDraft: string[]
  onToggleWard: (code: string) => void
}

export const WardSelectionDialog: React.FC<WardSelectionDialogProps> = ({
  selectedDistrictCodes,
  selectedProvinceCode,
  wardDraft,
  onToggleWard,
}) => {
  const t = useTranslations('seller.listingManagement.filter')
  const [query, setQuery] = React.useState('')

  const wardList = React.useMemo(() => {
    let allWards: Array<{ code: string; name: string; normalized: string }> = []

    if (selectedProvinceCode && !selectedDistrictCodes.length) {
      // Direct province->ward selection: get all wards from all districts in province
      const districtsInProvince =
        getDistrictsByProvinceCode(selectedProvinceCode)
      allWards = districtsInProvince.flatMap((district) =>
        getWardsByDistrictCode(district.code),
      )
    } else if (selectedDistrictCodes.length) {
      // District->ward selection: get wards from selected districts
      allWards = selectedDistrictCodes.flatMap((districtCode) =>
        getWardsByDistrictCode(districtCode),
      )
    }

    if (!query) return allWards

    // Filter by search query
    return allWards.filter(
      (ward) =>
        ward.name.toLowerCase().includes(query.toLowerCase()) ||
        ward.normalized.includes(query.toLowerCase().replace(/\s+/g, '')),
    )
  }, [query, selectedDistrictCodes, selectedProvinceCode])

  const contextName = React.useMemo(() => {
    if (selectedProvinceCode && !selectedDistrictCodes.length) {
      // Show province context
      return (
        findProvinceByCode(selectedProvinceCode)?.name || selectedProvinceCode
      )
    } else {
      // Show district context
      return selectedDistrictCodes
        .map((code) => findDistrictByCode(code)?.name)
        .filter(Boolean)
        .join(', ')
    }
  }, [selectedProvinceCode, selectedDistrictCodes])

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='p-3 bg-muted/30 rounded-lg border'>
          <Typography variant='small' className='text-muted-foreground'>
            {t('filteringWardsIn')}{' '}
            <span className='font-medium text-foreground'>{contextName}</span>
          </Typography>
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('search')}
        />
        <div className='max-h-[50vh] overflow-y-auto space-y-1 pr-2'>
          {wardList.map((w) => {
            const checked = wardDraft.includes(w.code)
            return (
              <label
                key={w.code}
                className='flex items-center justify-between gap-3 py-3 px-4 cursor-pointer select-none rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/30 transition-colors'
              >
                <span className='text-sm font-medium'>{w.name}</span>
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleWard(w.code)}
                  className='h-5 w-5 rounded-md border-muted-foreground data-[state=checked]:bg-primary'
                />
              </label>
            )
          })}
          {!wardList.length && (
            <div className='text-center text-xs text-muted-foreground py-8'>
              {t('noResult')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
