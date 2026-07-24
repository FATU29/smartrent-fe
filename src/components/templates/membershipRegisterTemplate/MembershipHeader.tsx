import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

interface MembershipHeaderProps {
  readonly title: string
  readonly subtitle: string
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className='relative overflow-hidden border-border'>
        <div className='absolute inset-x-0 top-0 h-px bg-primary/40' />
        <CardContent className='relative flex items-start gap-4'>
          <div className='hidden md:flex shrink-0 size-11 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Sparkles className='size-5' />
          </div>
          <div className='flex-1 space-y-1.5'>
            <Typography variant='h2'>{title}</Typography>
            <Typography variant='muted' className='max-w-2xl'>
              {subtitle}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
