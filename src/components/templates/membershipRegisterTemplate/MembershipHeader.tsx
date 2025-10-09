import React from 'react'

interface MembershipHeaderProps {
  title: string
  subtitle: string
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className='relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-background/40 dark:from-background dark:via-background/60 dark:to-background/30 p-6'>
      <div className='pointer-events-none absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(circle_at_30%_20%,black,transparent_70%)] bg-[conic-gradient(at_20%_30%,hsl(var(--primary)/0.35),transparent_60%)]' />
      <div className='relative flex flex-col gap-3'>
        <h1 className='text-3xl font-semibold tracking-tight text-foreground'>
          {title}
        </h1>
        <p className='text-sm text-muted-foreground max-w-2xl'>{subtitle}</p>
      </div>
    </div>
  )
}
