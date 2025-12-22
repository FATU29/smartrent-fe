import React from 'react'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { motion } from 'framer-motion'

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
      <Card>
        <CardContent className='space-y-1'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Typography variant='h2'>{title}</Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant='muted' className='max-w-2xl'>
              {subtitle}
            </Typography>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
