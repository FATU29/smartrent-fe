import { useNewsContext } from './index.context'
import PaginationControls from '@/components/molecules/paginationControls'

type NewsListPaginationProps = {
  className?: string
  showPerPageSelector?: boolean
  showPageInfo?: boolean
  showPageNumbers?: boolean
  maxVisiblePages?: number
}

const NewsListPagination = ({
  className,
  showPerPageSelector = false,
  showPageInfo = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
}: NewsListPaginationProps) => {
  const { filters, pagination, goToPage, updateFilters } = useNewsContext()

  const handleSizeChange = (newSize: string) => {
    updateFilters({ size: Number.parseInt(newSize, 10), page: 1 })
  }

  return (
    <PaginationControls
      className={className}
      showPerPageSelector={showPerPageSelector}
      showPageInfo={showPageInfo}
      showPageNumbers={showPageNumbers}
      maxVisiblePages={maxVisiblePages}
      pagination={pagination}
      currentSize={filters.size || ''}
      pageSizeOptions={['10', '20', '30', '50']}
      onPageChange={goToPage}
      onSizeChange={handleSizeChange}
    />
  )
}

export default NewsListPagination
