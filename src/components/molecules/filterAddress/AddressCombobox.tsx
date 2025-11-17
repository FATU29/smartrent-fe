import React from 'react'
import Combobox from '@/components/atoms/combobox'
import type { Option, PagedListResult } from './usePagedList'

interface AddressComboboxProps {
  label: string
  value?: string
  onValueChange: (value: string) => void
  options: Option[]
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  emptyText?: string
  noOptionsText?: string
  pager?: PagedListResult
}

/**
 * Reusable combobox for address fields
 * Reduces duplication in AddressInput
 */
export const AddressCombobox: React.FC<AddressComboboxProps> = ({
  label,
  value,
  onValueChange,
  options,
  disabled,
  loading,
  placeholder,
  searchable,
  searchPlaceholder,
  onSearchChange,
  emptyText,
  noOptionsText,
  pager,
}) => {
  return (
    <Combobox
      label={label}
      value={value}
      onValueChange={onValueChange}
      options={pager ? pager.visible : options}
      disabled={disabled}
      loading={loading}
      placeholder={placeholder}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      onSearchChange={onSearchChange}
      emptyText={emptyText}
      noOptionsText={noOptionsText}
      hasMore={pager?.hasMore}
      onLoadMore={pager?.loadMore}
      isLoadingMore={pager?.isLoadingMore}
    />
  )
}
