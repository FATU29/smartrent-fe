import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { motion } from 'framer-motion'
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='relative overflow-hidden border-primary/15'>
        <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80' />
        <div className='pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/8 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-32 -left-24 size-72 rounded-full bg-primary/5 blur-3xl' />
        <CardContent className='relative flex items-start gap-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
            className='hidden md:flex shrink-0 size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md ring-4 ring-primary/10'
          >
            <Sparkles className='size-6 text-primary-foreground' />
          </motion.div>
          <div className='flex-1 space-y-1'>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant='h2'>{title}</Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Typography variant='muted' className='max-w-2xl'>
                {subtitle}
              </Typography>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
