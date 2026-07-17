import React from 'react'
import { useTranslations } from 'next-intl'
import { GraduationCap } from 'lucide-react'
import { Badge } from '@/components/atoms/badge'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { GuideCard, BulletList } from '@/components/templates/guide/shared'

export type PolicyKey = 'listingRules' | 'terms' | 'privacy' | 'complaints'

// Section order per policy. Content lives in messages/*.json under
// `policies.<policyKey>.sections.<section>`; the template only owns ordering.
const POLICY_SECTIONS: Record<PolicyKey, readonly string[]> = {
  listingRules: ['eligibility', 'content', 'prohibited', 'media', 'moderation'],
  terms: ['acceptance', 'accounts', 'usage', 'content', 'disclaimer', 'changes'],
  privacy: ['collection', 'use', 'sharing', 'cookies', 'security', 'rights'],
  complaints: ['scope', 'channels', 'process', 'time'],
}

const CONTACT_EMAIL = 'smartrent.tools@gmail.com'
const BODY_TEXT_CLASS = 'text-sm leading-6 text-muted-foreground'

interface PolicyTemplateProps {
  policyKey: PolicyKey
}

const PolicyTemplate: React.FC<PolicyTemplateProps> = ({ policyKey }) => {
  const t = useTranslations('policies')
  const sections = POLICY_SECTIONS[policyKey]

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:space-y-7 sm:py-10'>
      <Card className='overflow-hidden border-border/60 bg-card/90 shadow-sm'>
        <div className='space-y-3 px-5 py-6 sm:px-7 sm:py-7'>
          <Badge
            variant='outline'
            className='w-fit gap-1.5 rounded-full border-primary/25 bg-primary/10 px-2.5 py-0.5 text-2xs font-medium text-primary'
          >
            <GraduationCap className='h-3.5 w-3.5' />
            {t('meta.academicBadge')}
          </Badge>
          <Typography variant='pageTitle' className='leading-tight'>
            {t(`${policyKey}.title`)}
          </Typography>
          <Typography variant='p' className={`max-w-2xl ${BODY_TEXT_CLASS}`}>
            {t(`${policyKey}.intro`)}
          </Typography>
          <Typography variant='small' className='text-muted-foreground'>
            {t('meta.updatedLabel')}: {t('meta.updatedDate')}
          </Typography>
        </div>
      </Card>

      {sections.map((section) => {
        const base = `${policyKey}.sections.${section}`
        const body = t.raw(`${base}.body`) as string[]
        const hasBullets = t.has(`${base}.bullets`)
        const bullets = hasBullets ? (t.raw(`${base}.bullets`) as string[]) : []

        return (
          <GuideCard key={section} title={t(`${base}.heading`)}>
            <div className='space-y-3'>
              {body.map((paragraph, i) => (
                <Typography
                  key={`${section}-p-${i}`}
                  variant='p'
                  className={BODY_TEXT_CLASS}
                >
                  {paragraph}
                </Typography>
              ))}
              {hasBullets && <BulletList items={bullets} />}
            </div>
          </GuideCard>
        )
      })}

      <Card className='border-primary/20 bg-primary/[0.04] px-5 py-5 sm:px-7'>
        <Typography variant='small' className='leading-6 text-muted-foreground'>
          {t('meta.academicNote')}
        </Typography>
        <Typography
          variant='small'
          className='mt-3 leading-6 text-muted-foreground'
        >
          {t('meta.contactPrompt')}{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className='text-primary hover:underline'
          >
            {CONTACT_EMAIL}
          </a>
        </Typography>
      </Card>
    </div>
  )
}

export default PolicyTemplate
