import React from 'react'
import Link from 'next/link'

type IconType = React.ComponentType<{ className?: string }>

type MobileNavCenterActionProps = {
  href: string
  ariaLabel: string
  icon: IconType
}

const MobileNavCenterAction: React.FC<MobileNavCenterActionProps> = ({
  href,
  ariaLabel,
  icon: Icon,
}) => {
  return (
    <li className='relative flex items-center justify-center'>
      <Link
        href={href}
        className='-mt-10 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        aria-label={ariaLabel}
      >
        <Icon className='h-7 w-7' />
      </Link>
    </li>
  )
}

export default MobileNavCenterAction
