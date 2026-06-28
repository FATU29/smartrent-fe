import React from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { Home, ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'

export const ListingNotFound: React.FC = () => {
  const router = useRouter()
  const t = useTranslations('apartmentDetail.notFound')

  return (
    <div className='flex flex-col items-center justify-center gap-8 py-20 text-center px-4'>
      {/* Animated illustration */}
      <div className='relative'>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className='relative'
        >
          {/* House container */}
          <div className='w-44 h-44 rounded-3xl bg-primary/8 border border-primary/12 flex items-center justify-center relative overflow-hidden'>
            {/* Background shimmer */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 1,
              }}
              className='absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12'
            />
            <Home size={88} className='text-primary/40' strokeWidth={1.2} />
          </div>

          {/* Question mark badge */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [-8, 8, -8] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.4,
            }}
            className='absolute -top-4 -right-4 w-11 h-11 rounded-full bg-amber-400 shadow-lg flex items-center justify-center'
          >
            <HelpCircle size={22} className='text-white' strokeWidth={2.5} />
          </motion.div>

          {/* Floating dots */}
          <motion.div
            animate={{ opacity: [0, 1, 0], y: [0, -20, -40] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.2,
            }}
            className='absolute top-2 left-0 w-2 h-2 rounded-full bg-primary/25'
          />
          <motion.div
            animate={{ opacity: [0, 1, 0], y: [0, -15, -30] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.9,
            }}
            className='absolute top-6 right-0 w-1.5 h-1.5 rounded-full bg-amber-400/50'
          />
        </motion.div>

        {/* Ground shadow */}
        <motion.div
          animate={{ scaleX: [1, 0.82, 1], opacity: [0.18, 0.1, 0.18] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className='mx-auto mt-3 w-28 h-2.5 bg-foreground/15 rounded-full blur-sm'
        />
      </div>

      {/* Text */}
      <div className='flex flex-col gap-3 max-w-sm'>
        <Typography variant='sectionTitle'>{t('title')}</Typography>
        <Typography variant='muted' className='text-base leading-relaxed'>
          {t('description')}
        </Typography>
      </div>

      {/* Actions */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <Button
          variant='outline'
          size='lg'
          onClick={() => router.back()}
          className='gap-2'
        >
          <ArrowLeft className='size-4' />
          {t('goBack')}
        </Button>
        <Button size='lg' onClick={() => router.push('/')} className='gap-2'>
          <Home className='size-4' />
          {t('goHome')}
        </Button>
      </div>
    </div>
  )
}
