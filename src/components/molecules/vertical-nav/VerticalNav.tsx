import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'

export type VerticalNavItem = {
  key: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: VerticalNavItem[]
  disabled?: boolean
  className?: string
}

type VerticalNavProps = {
  items: VerticalNavItem[]
  // i18n translator for item.key
  t: (key: string) => string
  // active matcher for current route
  isActive: (href: string) => boolean
  className?: string
  itemClassName?: string
  collapsed?: boolean
}

const VerticalNav: React.FC<VerticalNavProps> = ({
  items,
  t,
  isActive,
  className,
  itemClassName,
  collapsed = false,
}) => {
  return (
    <ul className={cn('flex flex-col items-stretch gap-1.5', className)}>
      {items.map((item) => (
        <VerticalNavNode
          key={item.key}
          item={item}
          t={t}
          isActive={isActive}
          depth={0}
          itemClassName={itemClassName}
          collapsed={collapsed}
        />
      ))}
    </ul>
  )
}

type NodeProps = {
  item: VerticalNavItem
  t: (key: string) => string
  isActive: (href: string) => boolean
  depth: number
  itemClassName?: string
  collapsed?: boolean
}

const VerticalNavNode: React.FC<NodeProps> = ({
  item,
  t,
  isActive,
  depth,
  itemClassName,
  collapsed = false,
}) => {
  const hasChildren = !!item.children && item.children.length > 0
  const isLeafActive = !!item.href && isActive(item.href)
  const isDescActive = useMemo(() => {
    if (!hasChildren) return false
    const anyActive = (nodes: VerticalNavItem[]): boolean =>
      nodes.some(
        (n) =>
          (n.href && isActive(n.href)) || (n.children && anyActive(n.children)),
      )
    return anyActive(item.children!)
  }, [hasChildren, item.children, isActive])

  const [open, setOpen] = useState<boolean>(isDescActive)
  useEffect(() => {
    setOpen(isDescActive)
  }, [isDescActive])

  // map depth to static padding classes to keep Tailwind tree-shake safe
  const depthPadding = ['', 'pl-2', 'pl-4', 'pl-6', 'pl-8'][Math.min(depth, 4)]
  const Icon = item.icon

  if (!hasChildren) {
    return (
      <li>
        <Button
          asChild
          variant='ghost'
          size='sm'
          className={cn(
            'w-full justify-start gap-2',
            depthPadding,
            isLeafActive && 'bg-accent text-accent-foreground',
            itemClassName,
            item.className,
          )}
        >
          <Link
            href={item.href || '#'}
            aria-current={isLeafActive ? 'page' : undefined}
          >
            {Icon ? <Icon className='size-4 shrink-0' /> : null}
            <span
              className={cn(
                'truncate transition-all duration-100 ease-out inline-block',
                collapsed
                  ? 'opacity-0 -translate-x-2 w-0 !m-0 overflow-hidden'
                  : 'opacity-100 translate-x-0 ml-1',
              )}
            >
              {t(item.key)}
            </span>
          </Link>
        </Button>
      </li>
    )
  }

  return (
    <li>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className={cn(
          'w-full justify-between',
          depthPadding,
          (isDescActive || open) && 'bg-accent/70 text-accent-foreground',
          itemClassName,
          item.className,
        )}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className='inline-flex items-center gap-2'>
          {Icon ? <Icon className='size-4 shrink-0' /> : null}
          <span
            className={cn(
              'truncate transition-all duration-100 ease-out inline-block',
              collapsed
                ? 'opacity-0 -translate-x-2 w-0 !m-0 overflow-hidden'
                : 'opacity-100 translate-x-0',
            )}
          >
            {t(item.key)}
          </span>
        </span>
        {!collapsed && (
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              open ? 'rotate-180' : '',
            )}
          />
        )}
      </Button>
      {!collapsed && (
        <ul
          className={cn(
            'mt-1 ml-2 border-l pl-2 space-y-1 transition-all duration-150 ease-out origin-top',
            open
              ? 'opacity-100 max-h-[600px]'
              : 'opacity-0 max-h-0 overflow-hidden',
          )}
          aria-hidden={!open}
        >
          {item.children!.map((child) => (
            <VerticalNavNode
              key={child.key}
              item={child}
              t={t}
              isActive={isActive}
              depth={depth + 1}
              itemClassName={itemClassName}
              collapsed={collapsed}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default VerticalNav
