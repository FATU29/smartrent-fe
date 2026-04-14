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
      icon: <Crown className='h-4 w-4 text-amber-700' />,
      cardClass: 'border-amber-200 bg-amber-50/70',
      titleClass: 'text-amber-800',
      badgeClass: 'border-amber-200 bg-amber-100 text-amber-800',
    },
    {
      key: 'vipSilver',
      icon: <Crown className='h-4 w-4 text-slate-600' />,
      cardClass: 'border-slate-200 bg-slate-50/70',
      titleClass: 'text-slate-700',
      badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
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
    <div className='space-y-8 pt-2 sm:space-y-10 sm:pt-4'>
      <Card className='overflow-hidden border-border/60 bg-card/80 shadow-sm'>
        <div className='grid gap-6 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.35fr_0.95fr] lg:gap-8'>
          <div className='space-y-4'>
            <div className='space-y-3'>
              <Typography
                variant='h2'
                className='max-w-3xl leading-tight tracking-tight text-balance'
              >
                {t('title')}
              </Typography>
              <Typography
                variant='lead'
                className='max-w-3xl text-base leading-8 text-muted-foreground'
              >
                {t('description')}
              </Typography>
            </div>
          </div>

          <div className='rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 sm:p-5'>
            <Typography variant='h4' className='leading-snug tracking-tight'>
              {t('gettingStarted.title')}
            </Typography>
            <Typography
              variant='p'
              className='mt-2 text-sm leading-7 text-muted-foreground'
            >
              {t('gettingStarted.description')}
            </Typography>
            <div className='mt-4 flex flex-wrap gap-2'>
              {[
                t('membership.title'),
                t('posts.title'),
                t('managing.title'),
                t('settings.title'),
              ].map((label) => (
                <Badge
                  key={label}
                  variant='outline'
                  className='rounded-full border-border/60 bg-background/70 px-3 py-1 text-[11px] font-medium text-muted-foreground'
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <GuideCard
        icon={<UserPlus />}
        title={t('gettingStarted.title')}
        description={t('gettingStarted.description')}
      >
        <Indented className='space-y-6'>
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
        <Indented className='space-y-8'>
          <div className='space-y-3'>
            <Typography variant='h4' className='leading-snug tracking-tight'>
              {t('membership.choosingPlan.title')}
            </Typography>
            <BulletList
              items={['tip1', 'tip2', 'tip3'].map((k) =>
                t(`membership.choosingPlan.${k}`),
              )}
            />
          </div>
          <div className='space-y-3'>
            <Typography variant='h4' className='leading-snug tracking-tight'>
              {t('membership.monthlyAllocation.title')}
            </Typography>
            <Typography
              variant='p'
              className='text-sm leading-7 text-muted-foreground'
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
        <Indented className='space-y-8'>
          <div className='space-y-4'>
            <Typography
              variant='h4'
              className='flex items-center gap-2 leading-snug tracking-tight'
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

            <div className='hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4'>
              {listingTypes.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-2xl border p-5 ${item.cardClass}`}
                >
                  <div className='mb-3 flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                      {item.icon}
                      <Typography
                        variant='h5'
                        className={`${item.titleClass} break-words leading-snug`}
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
                        className={`rounded-2xl border p-5 ${item.cardClass}`}
                      >
                        <div className='mb-3 flex items-start justify-between gap-3'>
                          <div className='flex min-w-0 items-center gap-2'>
                            {item.icon}
                            <Typography
                              variant='h5'
                              className={`${item.titleClass} break-words leading-snug`}
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
          <div className='space-y-3'>
            <Typography variant='h4' className='leading-snug tracking-tight'>
              {t('posts.bestPractices.title')}
            </Typography>
            <BulletList
              items={['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map((k) =>
                t(`posts.bestPractices.${k}`),
              )}
            />
          </div>
          <div className='space-y-3'>
            <Typography variant='h4' className='leading-snug tracking-tight'>
              {t('posts.pushing.title')}
            </Typography>
            <Typography
              variant='p'
              className='text-sm leading-7 text-muted-foreground'
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
        <Indented className='space-y-6'>
          {['editing', 'pausing', 'renewing'].map((k) => (
            <div key={k} className='space-y-2'>
              <Typography variant='h4' className='leading-snug tracking-tight'>
                {t(`managing.${k}.title`)}
              </Typography>
              <Typography
                variant='p'
                className='text-sm leading-7 text-muted-foreground'
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
        <Indented className='space-y-5'>
          <Typography
            variant='p'
            className='text-sm leading-7 text-muted-foreground'
          >
            {t('customers.features')}
          </Typography>
          <BulletList
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
        <Indented className='space-y-6'>
          {['profile', 'notifications'].map((k) => (
            <div key={k} className='space-y-2'>
              <Typography variant='h4' className='leading-snug tracking-tight'>
                {t(`settings.${k}.title`)}
              </Typography>
              <Typography
                variant='p'
                className='text-sm leading-7 text-muted-foreground'
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
        <Indented className='space-y-4'>
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
