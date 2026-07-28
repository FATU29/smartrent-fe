import React from 'react'
import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/atoms/alert'
import { Typography } from '@/components/atoms/typography'

export const MembershipGlossaryNote: React.FC = () => {
  const t = useTranslations('membershipPage.glossary')

  return (
    <Alert>
      <Info />
      <AlertTitle className='text-base font-bold'>{t('title')}</AlertTitle>
      <AlertDescription>
        <Typography
          as='ul'
          className='list-disc space-y-1 pl-4 text-foreground'
        >
          <li>{t('vip')}</li>
          <li>{t('push')}</li>
          <li>{t('media')}</li>
        </Typography>
      </AlertDescription>
    </Alert>
  )
}
