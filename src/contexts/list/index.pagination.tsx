import { useListContext } from './useListContext'
import { Button } from '@/components/atoms/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import classNames from 'classnames'

type ListPaginationProps = {
  className?: string
  showPerPageSelector?: boolean
  showPageInfo?: boolean
  showPageNumbers?: boolean
  maxVisiblePages?: number
}

const ListPagination = (props: ListPaginationProps) => {
  const {
    className,
    showPerPageSelector = true,
    showPageInfo = true,
    showPageNumbers = true,
    maxVisiblePages = 5,
  } = props

  const { filters, pagination, handleLoadNewPage, handleUpdateFilter } =
    useListContext()
  const t = useTranslations('pagination')

  const {
    total,
    page: currentPage,
    totalPages,
    hasNext,
    hasPrevious,
  } = pagination

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      handleLoadNewPage(newPage)
    }
  }

  const handlePerPageChange = (newPerPage: string) => {
    handleUpdateFilter({
      perPage: parseInt(newPerPage),
      page: 1,
    })
  }

  const getVisiblePages = () => {
    const pages: number[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const visiblePages = getVisiblePages()
  const startItem = (currentPage - 1) * filters.perPage + 1
  const endItem = Math.min(currentPage * filters.perPage, total)

  if (totalPages <= 1 && !showPageInfo) {
    return null
  }

  return (
    <div
      className={classNames(
        'flex flex-col space-y-4 sm:space-y-0 sm:flex-row items-center justify-between gap-4',
        className,
      )}
    >
      {/* Page Info - Hide on very small screens, show on sm+ */}
      {showPageInfo && (
        <div className='text-sm text-muted-foreground order-3 sm:order-1'>
          <span className='hidden sm:inline'>
            {t('showing')} {startItem}-{endItem} {t('of')} {total}{' '}
            {t('results')}
          </span>
          <span className='sm:hidden'>
            {currentPage}/{totalPages} ({total})
          </span>
        </div>
      )}

      {/* Navigation Controls - Center on mobile, maintain position on desktop */}
      <div className='flex items-center gap-1 order-1 sm:order-2'>
        {/* First Page - Hidden on mobile when screen is very small */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(1)}
          disabled={!hasPrevious}
          className='h-8 w-8 p-0 hidden xs:flex'
        >
          <ChevronsLeft className='h-4 w-4' />
        </Button>

        {/* Previous Page */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className='h-8 w-8 p-0'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        {/* Page Numbers - Simplified for mobile */}
        {showPageNumbers && (
          <>
            {/* Mobile: Show only current page and total */}
            <div className='flex items-center gap-1 sm:hidden'>
              <span className='px-2 text-sm font-medium min-w-[60px] text-center'>
                {currentPage} / {totalPages}
              </span>
            </div>

            {/* Desktop: Show full pagination */}
            <div className='hidden sm:flex items-center gap-1'>
              {visiblePages[0] > 1 && (
                <>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(1)}
                    className='h-8 w-8 p-0'
                  >
                    1
                  </Button>
                  {visiblePages[0] > 2 && (
                    <span className='px-2 text-muted-foreground'>...</span>
                  )}
                </>
              )}

              {visiblePages.map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handlePageChange(page)}
                  className='h-8 w-8 p-0'
                >
                  {page}
                </Button>
              ))}

              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <span className='px-2 text-muted-foreground'>...</span>
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(totalPages)}
                    className='h-8 w-8 p-0'
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Next Page */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className='h-8 w-8 p-0'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>

        {/* Last Page - Hidden on mobile when screen is very small */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNext}
          className='h-8 w-8 p-0 hidden xs:flex'
        >
          <ChevronsRight className='h-4 w-4' />
        </Button>
      </div>

      {/* Per Page Selector - Show on mobile, better mobile layout */}
      {showPerPageSelector && (
        <div className='flex items-center gap-2 order-2 sm:order-3'>
          <span className='text-sm text-muted-foreground hidden sm:inline'>
            {t('show')}
          </span>
          <Select
            value={filters.perPage.toString()}
            onValueChange={handlePerPageChange}
          >
            <SelectTrigger className='w-16 sm:w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5</SelectItem>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='15'>15</SelectItem>
              <SelectItem value='20'>20</SelectItem>
            </SelectContent>
          </Select>
          <span className='text-sm text-muted-foreground'>
            <span className='hidden sm:inline'>{t('perPage')}</span>
            <span className='sm:hidden'>/trang</span>
          </span>
        </div>
      )}
    </div>
  )
}

export default ListPagination
