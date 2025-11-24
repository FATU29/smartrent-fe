import { ReactNode } from 'react'
import { useListContext } from './useListContext'
import classNames from 'classnames'

type ListContentProps<T = unknown> = {
  renderItem: (item: T, index: number) => ReactNode
  skeleton: ReactNode
  emptyState: ReactNode
  className?: string
  gridClassName?: string
}

const ListContent = <T,>({
  renderItem,
  skeleton,
  emptyState,
  className,
  gridClassName,
}: ListContentProps<T>) => {
  const { items, isLoading } = useListContext<T>()

  if (isLoading && items.length === 0) {
    return <>{skeleton}</>
  }

  if (!items || items.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div className={classNames(className)}>
      <div
        className={classNames(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
          gridClassName,
        )}
      >
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>
    </div>
  )
}

export default ListContent
