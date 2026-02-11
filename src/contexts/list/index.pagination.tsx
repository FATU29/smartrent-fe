import { useListContext } from './useListContext'
import PaginationControls from '@/components/molecules/paginationControls'

type ListPaginationProps = {
  className?: string
  showPerPageSelector?: boolean
  showPageInfo?: boolean
  showPageNumbers?: boolean
  maxVisiblePages?: number
}

const ListPagination = ({
  className,
  showPerPageSelector = true,
  showPageInfo = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
}: ListPaginationProps) => {
  const { filters, pagination, goToPage, updateFilters } = useListContext()

  const { currentPage, pageSize, totalCount, totalPages } = pagination

  const handleSizeChange = (newSize: string) => {
    updateFilters({ size: parseInt(newSize), page: 1 })
  }

  return (
    <PaginationControls
      className={className}
      showPerPageSelector={showPerPageSelector}
      showPageInfo={showPageInfo}
      showPageNumbers={showPageNumbers}
      maxVisiblePages={maxVisiblePages}
      pagination={{
        currentPage,
        pageSize,
        totalItems: totalCount,
        totalPages,
      }}
      currentSize={filters.size || ''}
      pageSizeOptions={['5', '10', '15', '20']}
      onPageChange={goToPage}
      onSizeChange={handleSizeChange}
    />
  )
}

export default ListPagination
