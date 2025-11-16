import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { CreditCard, Wallet, Building2, CheckCircle2 } from 'lucide-react'
import {
  GuideCard,
  NumberedStepList,
  Indented,
} from '@/components/templates/guide/shared'

const PaymentGuideTemplate = () => {
  const t = useTranslations('guides.payment')

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h2' className='mb-2'>
          {t('title')}
        </Typography>
        <Typography variant='muted'>{t('description')}</Typography>
      </div>

      <GuideCard title={t('methods.title')}>
        <div className='grid gap-4 md:grid-cols-2'>
          {[
            {
              icon: <CreditCard className='h-5 w-5 text-primary' />,
              key: 'card',
              features: ['feature1', 'feature2', 'feature3'],
            },
            {
              icon: <Wallet className='h-5 w-5 text-primary' />,
              key: 'wallet',
              features: ['feature1', 'feature2'],
            },
            {
              icon: <Building2 className='h-5 w-5 text-primary' />,
              key: 'bank',
              features: ['feature1', 'feature2'],
            },
          ].map((m) => (
            <div key={m.key} className='p-4 border rounded-lg'>
              <div className='flex items-start gap-3 mb-3'>
                <div className='p-2 rounded-lg bg-primary/10'>{m.icon}</div>
                <div>
                  <Typography variant='h4' className='mb-1'>
                    {t(`methods.${m.key}.title`)}
                  </Typography>
                  <Typography variant='small' className='text-muted-foreground'>
                    {t(`methods.${m.key}.description`)}
                  </Typography>
                </div>
              </div>
              <ul className='space-y-2 text-sm'>
                {m.features.map((f) => (
                  <li key={f} className='flex items-start gap-2'>
                    <CheckCircle2 className='h-4 w-4 mt-0.5 text-green-600 shrink-0' />
                    <span>{t(`methods.${m.key}.${f}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </GuideCard>

      <GuideCard title={t('howToPay.title')}>
        <Indented>
          <NumberedStepList
            steps={['step1', 'step2', 'step3', 'step4'].map((k) => ({
              title: t(`howToPay.${k}.title`),
              description: t(`howToPay.${k}.description`),
            }))}
          />
        </Indented>
      </GuideCard>
    </div>
  )
}

export default PaymentGuideTemplate
