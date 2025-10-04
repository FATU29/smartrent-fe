import React from 'react'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/atoms/checkbox'
import { SearchInput } from '@/components/atoms/search-input'
import { VIETNAM_PROVINCES, searchProvinces } from '@/constants'

export interface ProvinceSelectionDialogProps {
  provinceDraft: string[]
  onToggleProvince: (code: string) => void
}

export const ProvinceSelectionDialog: React.FC<
  ProvinceSelectionDialogProps
> = ({ provinceDraft, onToggleProvince }) => {
  const t = useTranslations('seller.listingManagement.filter')
  const [query, setQuery] = React.useState('')

  const provinceList = React.useMemo(() => {
    if (!query) return VIETNAM_PROVINCES
    return searchProvinces(query)
  }, [query])

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('search')}
        />
        <div className='max-h-[50vh] overflow-y-auto space-y-1 pr-2'>
          {provinceList.map((p) => {
            const checked = provinceDraft.includes(p.code)
            return (
              <label
                key={p.code}
                className='flex items-center justify-between gap-3 py-3 px-4 cursor-pointer select-none rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/30 transition-colors'
              >
                <span className='text-sm font-medium'>{p.name}</span>
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleProvince(p.code)}
                  className='h-5 w-5 rounded-md border-muted-foreground data-[state=checked]:bg-primary'
                />
              </label>
            )
          })}
          {!provinceList.length && (
            <div className='text-center text-xs text-muted-foreground py-8'>
              {t('noResult')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
