import React from 'react'
import { Checkbox } from '@/components/atoms/checkbox'
import { VIETNAM_LISTING_TYPES } from '@/constants'

export interface ListingTypeSelectionDialogProps {
  listingTypeDraft: string[]
  onToggleListingType: (code: string) => void
}

export const ListingTypeSelectionDialog: React.FC<
  ListingTypeSelectionDialogProps
> = ({ listingTypeDraft, onToggleListingType }) => {
  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='max-h-[50vh] overflow-y-auto space-y-1 pr-2'>
          {VIETNAM_LISTING_TYPES.map((lt) => {
            const checked = listingTypeDraft.includes(lt.code)
            return (
              <label
                key={lt.code}
                className='flex items-center justify-between gap-3 py-3 px-4 cursor-pointer select-none rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/30 transition-colors'
              >
                <span className='text-sm font-medium'>{lt.name}</span>
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleListingType(lt.code)}
                  className='h-5 w-5 rounded-md border-muted-foreground data-[state=checked]:bg-primary'
                />
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
