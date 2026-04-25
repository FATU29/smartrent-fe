import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import { Badge } from '@/components/atoms/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'

const PAYMENT_METHODS = [
  {
    key: 'zalopay',
    logo: '/images/zalopay-icon.png',
  },
  {
    key: 'vnpay',
    logo: '/images/vnpay-logo.png',
  },
] as const

const PAYMENT_FLOW_STEPS = ['step1', 'step2', 'step3', 'step4'] as const

const NOTE_KEYS = ['note1', 'note2', 'note3', 'note4'] as const

const METHOD_FEATURE_KEYS = ['feature1', 'feature2', 'feature3'] as const

const METHOD_META_KEYS = ['bestFor', 'channels'] as const

const PaymentGuideTemplate = () => {
  const t = useTranslations('guides.payment')

  return (
    <div className='space-y-7 pt-2 md:space-y-8 md:pt-3'>
      <section className='space-y-3'>
        <div>
          <Badge variant='outline' className='mb-3 gap-1.5'>
            <ShieldCheck className='h-3.5 w-3.5' />
            {t('hero.badge')}
          </Badge>

          <Typography variant='h2' className='mb-2 flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-primary' />
            {t('title')}
          </Typography>
          <Typography
            variant='muted'
            className='max-w-3xl text-base leading-relaxed'
          >
            {t('description')}
          </Typography>
        </div>
      </section>

      <section className='grid gap-3 sm:grid-cols-2'>
        <Card className='py-0'>
          <CardHeader className='gap-1 py-5'>
            <CardDescription>
              {t('hero.metrics.methodCount.label')}
            </CardDescription>
            <CardTitle className='text-2xl'>
              {t('hero.metrics.methodCount.value')}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className='py-0'>
          <CardHeader className='gap-1 py-5'>
            <CardDescription>
              {t('hero.metrics.availability.label')}
            </CardDescription>
            <CardTitle className='text-2xl'>
              {t('hero.metrics.availability.value')}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className='py-0'>
        <CardHeader className='pt-5 pb-3 md:pt-6'>
          <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
            <CreditCard className='h-5 w-5 text-primary' />
            <span className='break-words'>{t('methods.title')}</span>
          </CardTitle>
          <CardDescription className='max-w-3xl'>
            {t('methods.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 pb-5 md:space-y-5'>
          <div className='hidden gap-4 lg:grid lg:grid-cols-2'>
            {PAYMENT_METHODS.map((method) => {
              return (
                <Card key={method.key} className='h-full py-0'>
                  <CardHeader className='pt-4 pb-3 md:pt-5'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-white dark:bg-white/95'>
                          <Image
                            src={method.logo}
                            alt={t(`methods.${method.key}.title`)}
                            width={34}
                            height={34}
                            className='h-8 w-8 object-contain'
                          />
                        </div>

                        <div className='min-w-0'>
                          <CardTitle className='text-base leading-snug sm:text-lg'>
                            <span className='break-words'>
                              {t(`methods.${method.key}.title`)}
                            </span>
                          </CardTitle>
                          <CardDescription className='mt-1 leading-relaxed'>
                            {t(`methods.${method.key}.description`)}
                          </CardDescription>
                        </div>
                      </div>

                      <Badge variant='outline' className='shrink-0'>
                        {t(`methods.${method.key}.badge`)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-4 pb-5'>
                    <div className='space-y-2.5 text-sm'>
                      {METHOD_FEATURE_KEYS.map((featureKey) => (
                        <div
                          key={featureKey}
                          className='flex items-start gap-2'
                        >
                          <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
                          <span>
                            {t(`methods.${method.key}.${featureKey}`)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className='space-y-2 border-t pt-3 text-sm'>
                      {METHOD_META_KEYS.map((metaKey) => (
                        <div
                          key={metaKey}
                          className='flex items-start justify-between gap-4'
                        >
                          <span className='text-muted-foreground'>
                            {t(`methods.metaLabels.${metaKey}`)}
                          </span>
                          <span className='text-right font-medium'>
                            {t(`methods.${method.key}.${metaKey}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className='lg:hidden'>
            <Carousel opts={{ align: 'start', loop: false }} className='w-full'>
              <CarouselContent>
                {PAYMENT_METHODS.map((method) => {
                  return (
                    <CarouselItem
                      key={method.key}
                      className='basis-[92%] sm:basis-[82%]'
                    >
                      <Card className='h-full py-0'>
                        <CardHeader className='pt-4 pb-3'>
                          <div className='space-y-3'>
                            <div className='flex items-start gap-3'>
                              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-white dark:bg-white/95'>
                                <Image
                                  src={method.logo}
                                  alt={t(`methods.${method.key}.title`)}
                                  width={32}
                                  height={32}
                                  className='h-7 w-7 object-contain'
                                />
                              </div>

                              <div className='min-w-0 flex-1'>
                                <CardTitle className='text-base leading-snug sm:text-lg'>
                                  <span className='break-words'>
                                    {t(`methods.${method.key}.title`)}
                                  </span>
                                </CardTitle>
                                <CardDescription className='mt-1 text-sm leading-relaxed'>
                                  {t(`methods.${method.key}.description`)}
                                </CardDescription>
                              </div>
                            </div>

                            <Badge variant='outline' className='w-fit'>
                              {t(`methods.${method.key}.badge`)}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className='space-y-4 pb-5'>
                          <div className='space-y-2.5 text-sm'>
                            {METHOD_FEATURE_KEYS.map((featureKey) => (
                              <div
                                key={featureKey}
                                className='flex items-start gap-2'
                              >
                                <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
                                <span>
                                  {t(`methods.${method.key}.${featureKey}`)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className='space-y-2 border-t pt-3 text-sm'>
                            {METHOD_META_KEYS.map((metaKey) => (
                              <div
                                key={metaKey}
                                className='flex items-start justify-between gap-4 rounded-md border bg-muted/30 px-2.5 py-2'
                              >
                                <span className='text-muted-foreground'>
                                  {t(`methods.metaLabels.${metaKey}`)}
                                </span>
                                <span className='text-right font-medium'>
                                  {t(`methods.${method.key}.${metaKey}`)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-[1.35fr_1fr]'>
        <Card className='py-0'>
          <CardHeader className='pt-5 pb-2 md:pt-6'>
            <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
              <Wallet className='h-5 w-5 text-primary' />
              <span className='break-words'>{t('howToPay.title')}</span>
            </CardTitle>
            <CardDescription>{t('howToPay.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2.5 pb-5'>
            {PAYMENT_FLOW_STEPS.map((stepKey, index) => (
              <div
                key={stepKey}
                className='rounded-lg border px-3 py-3 md:px-4'
              >
                <div className='mb-1 flex items-center gap-2'>
                  <span className='inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold'>
                    {index + 1}
                  </span>
                  <span className='text-sm font-semibold md:text-base'>
                    {t(`howToPay.${stepKey}.title`)}
                  </span>
                </div>
                <Typography
                  variant='small'
                  className='leading-5 text-muted-foreground'
                >
                  {t(`howToPay.${stepKey}.description`)}
                </Typography>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='py-0'>
          <CardHeader className='pt-5 pb-2 md:pt-6'>
            <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
              <ShieldCheck className='h-5 w-5 text-primary' />
              <span className='break-words'>{t('notes.title')}</span>
            </CardTitle>
            <CardDescription>{t('notes.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 pb-5'>
            <Alert>
              <ShieldCheck className='h-4 w-4' />
              <AlertTitle>{t('notes.securityTitle')}</AlertTitle>
              <AlertDescription>
                {t('notes.securityDescription')}
              </AlertDescription>
            </Alert>

            <div className='space-y-2'>
              {NOTE_KEYS.map((noteKey) => (
                <div
                  key={noteKey}
                  className='flex items-start gap-2 rounded-lg border px-3 py-2.5'
                >
                  <Clock3 className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                  <Typography
                    variant='small'
                    className='leading-5 text-muted-foreground'
                  >
                    {t(`notes.${noteKey}`)}
                  </Typography>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PaymentGuideTemplate
