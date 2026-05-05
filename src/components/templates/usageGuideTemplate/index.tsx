import React from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import {
  UserPlus,
  Package,
  FileText,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Crown,
  Sparkles,
} from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'
import {
  GuideCard,
  BulletList,
  CheckList,
  NumberedStepList,
  Indented,
} from '@/components/templates/guide/shared'

const UsageGuideTemplate = () => {
  const t = useTranslations('guides.usage')

  const listingTypes = [
    {
      key: 'vipDiamond',
      icon: <Crown className='h-4 w-4 text-primary' />,
      cardClass: 'border-primary/25 bg-primary/5',
      titleClass: 'text-primary',
      badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    },
    {
      key: 'vipGold',
      icon: <Crown className='h-4 w-4 text-amber-700 dark:text-amber-400' />,
      cardClass:
        'border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10',
      titleClass: 'text-amber-800 dark:text-amber-300',
      badgeClass:
        'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300',
    },
    {
      key: 'vipSilver',
      icon: <Crown className='h-4 w-4 text-muted-foreground' />,
      cardClass: 'border-border bg-muted/50',
      titleClass: 'text-muted-foreground',
      badgeClass: 'border-border bg-muted text-muted-foreground',
    },
    {
      key: 'standard',
      icon: <Sparkles className='h-4 w-4 text-muted-foreground' />,
      cardClass: 'border-border bg-muted/20',
      titleClass: 'text-foreground',
      badgeClass: 'border-border bg-background text-foreground',
    },
  ] as const

  return (
    <div className='space-y-6 pt-2 sm:space-y-7 sm:pt-3'>
      <Card className='overflow-hidden border-border/60 bg-card/90 shadow-sm'>
        <div className='relative px-4 py-4 sm:px-6 sm:py-5'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='min-w-0 space-y-2'>
              <Badge
                variant='outline'
                className='w-fit rounded-full border-primary/25 bg-primary/10 px-2.5 py-0.5 text-2xs font-medium text-primary'
              >
                {t('gettingStarted.title')}
              </Badge>

              <Typography
                variant='pageTitle'
                className='max-w-3xl leading-tight'
              >
                {t('title')}
              </Typography>

              <Typography
                variant='p'
                className='max-w-3xl text-sm leading-6 text-muted-foreground sm:text-md'
              >
                {t('description')}
              </Typography>
            </div>

            <div className='rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 sm:p-3.5 lg:min-w-[320px]'>
              <Typography
                variant='small'
                className='text-sm font-semibold leading-5 text-foreground'
              >
                {t('gettingStarted.description')}
              </Typography>
              <div className='mt-2.5 flex flex-wrap gap-1.5'>
                {[
                  t('membership.title'),
                  t('posts.title'),
                  t('managing.title'),
                  t('settings.title'),
                ].map((label) => (
                  <Badge
                    key={label}
                    variant='outline'
                    className='rounded-full border-border/60 bg-background/75 px-2.5 py-0.5 text-xs leading-5 font-medium text-muted-foreground'
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <GuideCard
        icon={<UserPlus />}
        title={t('gettingStarted.title')}
        description={t('gettingStarted.description')}
      >
        <Indented className='space-y-4'>
          <NumberedStepList
            steps={['step1', 'step2', 'step3'].map((k) => ({
              title: t(`gettingStarted.${k}.title`),
              description: t(`gettingStarted.${k}.description`),
            }))}
          />
        </Indented>
      </GuideCard>

      <GuideCard
        icon={<Package />}
        title={t('membership.title')}
        description={t('membership.description')}
      >
        <Indented className='space-y-6'>
          <div className='space-y-2'>
            <Typography
              variant='h4'
              className='text-base leading-snug tracking-tight sm:text-lg'
            >
              {t('membership.choosingPlan.title')}
            </Typography>
            <BulletList
              tight
              items={['tip1', 'tip2', 'tip3'].map((k) =>
                t(`membership.choosingPlan.${k}`),
              )}
            />
          </div>
          <div className='space-y-2'>
            <Typography
              variant='h4'
              className='text-base leading-snug tracking-tight sm:text-lg'
            >
              {t('membership.monthlyAllocation.title')}
            </Typography>
            <Typography
              variant='p'
              className='text-sm leading-6 text-muted-foreground'
            >
              {t('membership.monthlyAllocation.description')}
            </Typography>
            <div className='rounded-2xl border border-border/70 bg-muted/40 p-4'>
              <Typography
                variant='small'
                className='leading-6 text-muted-foreground'
              >
                <strong>{t('membership.monthlyAllocation.example')}</strong>
              </Typography>
            </div>
          </div>
        </Indented>
      </GuideCard>

      <GuideCard
        icon={<FileText />}
        title={t('posts.title')}
        description={t('posts.description')}
      >
        <Indented className='space-y-6'>
          <div className='space-y-3'>
            <Typography
              variant='h4'
              className='flex items-center gap-2 text-base leading-snug tracking-tight sm:text-lg'
            >
              <Crown className='h-4 w-4 text-primary' />
              {t('posts.types.title')}
            </Typography>
            <Typography
              variant='small'
              className='leading-6 text-muted-foreground'
            >
              {t('posts.types.referenceNote')}
            </Typography>

            <div className='hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4'>
              {listingTypes.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-2xl border p-4 ${item.cardClass}`}
                >
                  <div className='mb-3 flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                      {item.icon}
                      <Typography
                        variant='h5'
                        className={`${item.titleClass} text-base break-words leading-snug`}
                      >
                        {t(`posts.types.${item.key}.name`)}
                      </Typography>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${item.badgeClass}`}
                    >
                      {t(`posts.types.${item.key}.badge`)}
                    </span>
                  </div>
                  <Typography
                    variant='small'
                    className='leading-6 text-muted-foreground'
                  >
                    {t(`posts.types.${item.key}.description`)}
                  </Typography>
                </div>
              ))}
            </div>

            <div className='md:hidden'>
              <Carousel
                opts={{ align: 'start', loop: false }}
                className='w-full'
              >
                <CarouselContent>
                  {listingTypes.map((item) => (
                    <CarouselItem
                      key={item.key}
                      className='basis-[90%] sm:basis-[72%]'
                    >
                      <div
                        className={`rounded-2xl border p-4 ${item.cardClass}`}
                      >
                        <div className='mb-3 flex items-start justify-between gap-3'>
                          <div className='flex min-w-0 items-center gap-2'>
                            {item.icon}
                            <Typography
                              variant='h5'
                              className={`${item.titleClass} text-base break-words leading-snug`}
                            >
                              {t(`posts.types.${item.key}.name`)}
                            </Typography>
                          </div>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${item.badgeClass}`}
                          >
                            {t(`posts.types.${item.key}.badge`)}
                          </span>
                        </div>
                        <Typography
                          variant='small'
                          className='leading-6 text-muted-foreground'
                        >
                          {t(`posts.types.${item.key}.description`)}
                        </Typography>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
          <div className='space-y-2'>
            <Typography
              variant='h4'
              className='text-base leading-snug tracking-tight sm:text-lg'
            >
              {t('posts.bestPractices.title')}
            </Typography>
            <BulletList
              tight
              items={['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map((k) =>
                t(`posts.bestPractices.${k}`),
              )}
            />
          </div>
          <div className='space-y-2'>
            <Typography
              variant='h4'
              className='text-base leading-snug tracking-tight sm:text-lg'
            >
              {t('posts.pushing.title')}
            </Typography>
            <Typography
              variant='p'
              className='text-sm leading-6 text-muted-foreground'
            >
              {t('posts.pushing.description')}
            </Typography>
            <div className='rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/20'>
              <Typography
                variant='small'
                className='leading-6 text-amber-900 dark:text-amber-100'
              >
                <strong>{t('posts.pushing.tip')}</strong>
              </Typography>
            </div>
          </div>
        </Indented>
      </GuideCard>

      <GuideCard
        icon={<TrendingUp />}
        title={t('managing.title')}
        description={t('managing.description')}
      >
        <Indented className='space-y-4'>
          {['editing', 'pausing', 'renewing'].map((k) => (
            <div key={k} className='space-y-1.5'>
              <Typography
                variant='h4'
                className='text-base leading-snug tracking-tight sm:text-lg'
              >
                {t(`managing.${k}.title`)}
              </Typography>
              <Typography
                variant='p'
                className='text-sm leading-6 text-muted-foreground'
              >
                {t(`managing.${k}.description`)}
              </Typography>
            </div>
          ))}
        </Indented>
      </GuideCard>

      <GuideCard
        icon={<Users />}
        title={t('customers.title')}
        description={t('customers.description')}
      >
        <Indented className='space-y-4'>
          <Typography
            variant='p'
            className='text-sm leading-6 text-muted-foreground'
          >
            {t('customers.features')}
          </Typography>
          <BulletList
            tight
            items={['feature1', 'feature2', 'feature3'].map((k) =>
              t(`customers.${k}`),
            )}
          />
        </Indented>
      </GuideCard>

      <GuideCard
        icon={<Settings />}
        title={t('settings.title')}
        description={t('settings.description')}
      >
        <Indented className='space-y-4'>
          {['profile', 'notifications'].map((k) => (
            <div key={k} className='space-y-1.5'>
              <Typography
                variant='h4'
                className='text-base leading-snug tracking-tight sm:text-lg'
              >
                {t(`settings.${k}.title`)}
              </Typography>
              <Typography
                variant='p'
                className='text-sm leading-6 text-muted-foreground'
              >
                {t(`settings.${k}.description`)}
              </Typography>
            </div>
          ))}
        </Indented>
      </GuideCard>

      <GuideCard
        icon={<Bell />}
        title={t('tips.title')}
        className='border-emerald-200/70 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20'
        headerBgClass='bg-emerald-100 dark:bg-emerald-900/40'
        iconClassName='text-green-600 dark:text-green-400'
      >
        <Indented className='space-y-3'>
          <CheckList
            items={['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map((k) =>
              t(`tips.${k}`),
            )}
          />
        </Indented>
      </GuideCard>
    </div>
  )
}

export default UsageGuideTemplate
