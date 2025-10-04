import React from 'react'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/atoms/checkbox'
import { SearchInput } from '@/components/atoms/search-input'
import { Typography } from '@/components/atoms/typography'
import {
  searchDistricts,
  findProvinceByCode,
  getDistrictsByProvinceCode,
} from '@/constants'

export interface DistrictSelectionDialogProps {
  selectedProvinceCode: string
  districtDraft: string[]
  onToggleDistrict: (code: string) => void
}

export const DistrictSelectionDialog: React.FC<
  DistrictSelectionDialogProps
> = ({ selectedProvinceCode, districtDraft, onToggleDistrict }) => {
  const t = useTranslations('seller.listingManagement.filter')
  const [query, setQuery] = React.useState('')

  const districtList = React.useMemo(() => {
    if (!selectedProvinceCode) return []
    if (!query) return getDistrictsByProvinceCode(selectedProvinceCode)
    return searchDistricts(query, selectedProvinceCode)
  }, [query, selectedProvinceCode])

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='p-3 bg-muted/30 rounded-lg border'>
          <Typography variant='small' className='text-muted-foreground'>
            {t('filteringDistrictsIn')}{' '}
            <span className='font-medium text-foreground'>
              {findProvinceByCode(selectedProvinceCode)?.name}
            </span>
          </Typography>
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('search')}
        />
        <div className='max-h-[50vh] overflow-y-auto space-y-1 pr-2'>
          {districtList.map((d) => {
            const checked = districtDraft.includes(d.code)
            return (
              <label
                key={d.code}
                className='flex items-center justify-between gap-3 py-3 px-4 cursor-pointer select-none rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/30 transition-colors'
              >
                <span className='text-sm font-medium'>{d.name}</span>
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleDistrict(d.code)}
                  className='h-5 w-5 rounded-md border-muted-foreground data-[state=checked]:bg-primary'
                />
              </label>
            )
          })}
          {!districtList.length && (
            <div className='text-center text-xs text-muted-foreground py-8'>
              {t('noResult')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
