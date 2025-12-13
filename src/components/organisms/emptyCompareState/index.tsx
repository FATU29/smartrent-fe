import Link from 'next/link'
import { GitCompare } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'

interface EmptyCompareStateProps {
  className?: string
}

const EmptyCompareState: React.FC<EmptyCompareStateProps> = ({ className }) => {
  const t = useTranslations('compare')

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
    >
      <div className='mb-6 relative'>
        <div className='absolute inset-0 bg-primary/10 rounded-full blur-2xl' />
        <div className='relative bg-muted rounded-full p-6'>
          <GitCompare className='w-16 h-16 text-primary' />
        </div>
      </div>

      <h2 className='text-2xl font-bold mb-2'>{t('empty.title')}</h2>
      <p className='text-muted-foreground mb-8 max-w-md'>
        {t('empty.description')}
      </p>

      <Link href='/'>
        <Button size='lg' className='gap-2'>
          {t('empty.action')}
        </Button>
      </Link>
    </div>
  )
}

export default EmptyCompareState
