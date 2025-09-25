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
}

const VerticalNav: React.FC<VerticalNavProps> = ({
  items,
  t,
  isActive,
  className,
  itemClassName,
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
}

const VerticalNavNode: React.FC<NodeProps> = ({
  item,
  t,
  isActive,
  depth,
  itemClassName,
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
            {Icon ? <Icon className='size-4' /> : null}
            <span>{t(item.key)}</span>
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
          {Icon ? <Icon className='size-4' /> : null}
          <span>{t(item.key)}</span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 transition-transform',
            open ? 'rotate-180' : '',
          )}
        />
      </Button>
      {open && (
        <ul className='mt-1 ml-2 border-l pl-2 space-y-1'>
          {item.children!.map((child) => (
            <VerticalNavNode
              key={child.key}
              item={child}
              t={t}
              isActive={isActive}
              depth={depth + 1}
              itemClassName={itemClassName}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default VerticalNav
