import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'

interface MembershipHeaderProps {
  readonly title: string
  readonly subtitle: string
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <Card>
      <CardContent className='space-y-1'>
        <Typography variant='h2'>{title}</Typography>
        <Typography variant='muted' className='max-w-2xl'>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  )
}
