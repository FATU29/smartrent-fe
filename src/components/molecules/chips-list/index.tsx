import React from 'react'
import { X } from 'lucide-react'

export interface ChipItem {
  code: string
  name: string
}

export interface ChipsListProps {
  items: ChipItem[]
  onRemove: (code: string) => void
}

export const ChipsList: React.FC<ChipsListProps> = ({ items, onRemove }) => {
  if (!items.length) return null

  return (
    <div className='flex flex-wrap gap-2'>
      {items.map((item) => (
        <div
          key={item.code}
          className='inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm border border-primary/20'
        >
          <span className='font-medium'>{item.name}</span>
          <button
            type='button'
            onClick={() => onRemove(item.code)}
            className='hover:bg-primary/20 rounded-full p-0.5 transition-colors'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>
      ))}
    </div>
  )
}
