import React from 'react'
import { useTranslations } from 'next-intl'
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
} from 'lucide-react'
import {
  GuideCard,
  BulletList,
  CheckList,
  NumberedStepList,
  Indented,
} from '@/components/templates/guide/shared'

const UsageGuideTemplate = () => {
  const t = useTranslations('guides.usage')

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h2' className='mb-2'>
          {t('title')}
        </Typography>
        <Typography variant='muted'>{t('description')}</Typography>
      </div>

      <GuideCard
        icon={<UserPlus />}
        title={t('gettingStarted.title')}
        description={t('gettingStarted.description')}
      >
        <Indented>
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
          <div>
            <Typography variant='h4' className='mb-3'>
              {t('membership.choosingPlan.title')}
            </Typography>
            <BulletList
              items={['tip1', 'tip2', 'tip3'].map((k) =>
                t(`membership.choosingPlan.${k}`),
              )}
            />
          </div>
          <div>
            <Typography variant='h4' className='mb-3'>
              {t('membership.monthlyAllocation.title')}
            </Typography>
            <Typography variant='p' className='text-muted-foreground mb-3'>
              {t('membership.monthlyAllocation.description')}
            </Typography>
            <div className='p-4 bg-muted rounded-lg'>
              <Typography variant='small' className='text-muted-foreground'>
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
          <div>
            <Typography variant='h4' className='mb-3'>
              {t('posts.types.title')}
            </Typography>
            <div className='space-y-3'>
              {[
                {
                  key: 'vipGold',
                  color: 'text-yellow-600',
                  descKey: 'vipGoldDesc',
                  icon: <Crown className='h-4 w-4 text-yellow-600' />,
                },
                {
                  key: 'vipSilver',
                  color: 'text-gray-600',
                  icon: <Crown className='h-4 w-4 text-gray-400' />,
                  descKey: 'vipSilverDesc',
                },
                { key: 'regular', color: '', descKey: 'regularDesc' },
              ].map((p) => (
                <div key={p.key} className='p-3 border rounded-lg'>
                  <div className='flex items-center gap-2 mb-1'>
                    {p.icon}
                    <Typography variant='h5' className={p.color || undefined}>
                      {t(`posts.types.${p.key}`)}
                    </Typography>
                  </div>
                  <Typography variant='small' className='text-muted-foreground'>
                    {t(`posts.types.${p.descKey}`)}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Typography variant='h4' className='mb-3'>
              {t('posts.bestPractices.title')}
            </Typography>
            <BulletList
              items={['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map((k) =>
                t(`posts.bestPractices.${k}`),
              )}
            />
          </div>
          <div>
            <Typography variant='h4' className='mb-3'>
              {t('posts.pushing.title')}
            </Typography>
            <Typography variant='p' className='text-muted-foreground mb-3'>
              {t('posts.pushing.description')}
            </Typography>
            <div className='p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg'>
              <Typography
                variant='small'
                className='text-amber-900 dark:text-amber-100'
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
            <div key={k}>
              <Typography variant='h4' className='mb-2'>
                {t(`managing.${k}.title`)}
              </Typography>
              <Typography variant='p' className='text-muted-foreground'>
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
          <Typography variant='p' className='text-muted-foreground'>
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
        <Indented className='space-y-4'>
          {['profile', 'notifications'].map((k) => (
            <div key={k}>
              <Typography variant='h4' className='mb-2'>
                {t(`settings.${k}.title`)}
              </Typography>
              <Typography variant='p' className='text-muted-foreground'>
                {t(`settings.${k}.description`)}
              </Typography>
            </div>
          ))}
        </Indented>
      </GuideCard>

      <GuideCard
        icon={<Bell />}
        title={t('tips.title')}
        className='bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
        headerBgClass='bg-green-100 dark:bg-green-900'
        iconClassName='text-green-600 dark:text-green-400'
      >
        <Indented>
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
