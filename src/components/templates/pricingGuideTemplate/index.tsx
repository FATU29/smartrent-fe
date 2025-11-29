import React from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { Badge } from '@/components/atoms/badge'
import type {
  Membership,
  MembershipPackageLevel,
} from '@/api/types/membership.type'
import type { VipTier } from '@/api/types/vip-tier.type'
import { useMembershipPackages } from '@/hooks/useMembership'
import { useVipTiers } from '@/hooks/useVipTiers'

interface PricingGuideTemplateProps {
  memberships?: Membership[]
  vipTiers?: VipTier[]
}

const PricingGuideTemplate: React.FC<PricingGuideTemplateProps> = ({
  memberships: ssrMemberships = [],
  vipTiers: ssrVipTiers = [],
}) => {
  const t = useTranslations('guides.pricing')

  const {
    data: clientMemberships,
    isLoading: membershipsLoading,
    error: membershipsError,
  } = useMembershipPackages()

  const {
    data: clientVipTiers,
    isLoading: vipTiersLoading,
    error: vipTiersError,
  } = useVipTiers()

  // Use client data if available, otherwise fallback to SSR data
  const memberships = clientMemberships || ssrMemberships
  const vipTiers = clientVipTiers || ssrVipTiers

  // Show loading state
  if (membershipsLoading || vipTiersLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>{t('loading')}</p>
      </div>
    )
  }

  // Show error state
  if (membershipsError || vipTiersError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-destructive'>
          {membershipsError instanceof Error
            ? membershipsError.message
            : vipTiersError instanceof Error
              ? vipTiersError.message
              : t('error')}
        </p>
      </div>
    )
  }

  // Sort memberships by level
  const sortedMemberships = [...memberships].sort((a, b) => {
    const levelOrder: Record<MembershipPackageLevel, number> = {
      BASIC: 1,
      STANDARD: 2,
      ADVANCED: 3,
    }
    return (
      levelOrder[a.packageLevel as MembershipPackageLevel] -
      levelOrder[b.packageLevel as MembershipPackageLevel]
    )
  })

  // Sort VIP tiers by level
  const sortedVipTiers = [...vipTiers].sort((a, b) => a.tierLevel - b.tierLevel)

  // Helper to get benefit quantity by type
  const getBenefitQuantity = (membership: Membership, benefitType: string) => {
    const benefit = membership.benefits.find(
      (b) => b.benefitType === benefitType,
    )
    return benefit?.quantityPerMonth || 0
  }

  // Helper to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  // Get VIP tier by code
  const getVipTier = (code: string) => {
    return sortedVipTiers.find((tier) => tier.tierCode === code)
  }

  const goldTier = getVipTier('GOLD')
  const silverTier = getVipTier('SILVER')
  const normalTier = getVipTier('NORMAL')

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <Typography variant='h2' className='mb-2'>
          {t('title')}
        </Typography>
        <Typography variant='muted'>{t('description')}</Typography>
      </div>

      {/* Membership Plans Pricing */}
      <Card className='p-6'>
        <Typography variant='h3' className='mb-4'>
          {t('membership.title')}
        </Typography>
        <Typography variant='p' className='mb-6 text-muted-foreground'>
          {t('membership.description')}
        </Typography>

        <div className='space-y-4'>
          {sortedMemberships.map((membership) => {
            const isStandard = membership.packageLevel === 'STANDARD'
            const goldPosts = getBenefitQuantity(membership, 'POST_GOLD')
            const silverPosts = getBenefitQuantity(membership, 'POST_SILVER')
            const standardPosts = getBenefitQuantity(
              membership,
              'POST_STANDARD',
            )

            return (
              <div
                key={membership.membershipId}
                className={`p-4 border rounded-lg ${
                  isStandard ? 'border-2 border-primary bg-primary/5' : ''
                }`}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <Typography variant='h4'>
                        {membership.packageName}
                      </Typography>
                      {isStandard && (
                        <Badge variant='default'>
                          {t('membership.plans.popular')}
                        </Badge>
                      )}
                    </div>
                    <Typography
                      variant='small'
                      className='text-muted-foreground'
                    >
                      {membership.description}
                    </Typography>
                  </div>
                  {membership.discountPercentage > 0 && (
                    <Badge variant='secondary'>
                      -{membership.discountPercentage}%
                    </Badge>
                  )}
                </div>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Giá:</span>{' '}
                    <strong>{formatPrice(membership.salePrice)} đ/tháng</strong>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>VIP Vàng:</span>{' '}
                    <strong>{goldPosts} tin</strong>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>VIP Bạc:</span>{' '}
                    <strong>{silverPosts} tin</strong>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Tin Thường:</span>{' '}
                    <strong>{standardPosts} tin</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className='mt-6 p-4 bg-muted rounded-lg'>
          <Typography variant='small' className='text-muted-foreground'>
            <strong>{t('membership.note.title')}</strong>{' '}
            {t('membership.note.content')}
          </Typography>
        </div>
      </Card>

      {/* Post Types Pricing */}
      <Card className='p-6'>
        <Typography variant='h3' className='mb-4'>
          {t('postTypes.title')}
        </Typography>

        <div className='space-y-4'>
          {goldTier && (
            <div className='p-4 border rounded-lg'>
              <div className='flex items-start justify-between mb-2'>
                <Typography variant='h4' className='text-yellow-600'>
                  {t('postTypes.vipGold.name')}
                </Typography>
                <Badge variant='default' className='bg-yellow-600'>
                  {t('postTypes.priority.highest')}
                </Badge>
              </div>
              <Typography variant='p' className='mb-3 text-muted-foreground'>
                {goldTier.description || t('postTypes.vipGold.description')}
              </Typography>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('postTypes.duration')}:
                  </span>{' '}
                  <strong>
                    {goldTier.price30Days
                      ? '30'
                      : goldTier.price15Days
                        ? '15'
                        : '10'}{' '}
                    ngày
                  </strong>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('postTypes.price')}:
                  </span>{' '}
                  <strong className='text-yellow-600'>
                    {formatPrice(
                      goldTier.price30Days ||
                        goldTier.price15Days ||
                        goldTier.price10Days,
                    )}{' '}
                    đ
                  </strong>
                </div>
              </div>
            </div>
          )}

          {silverTier && (
            <div className='p-4 border rounded-lg'>
              <div className='flex items-start justify-between mb-2'>
                <Typography variant='h4' className='text-gray-400'>
                  {t('postTypes.vipSilver.name')}
                </Typography>
                <Badge variant='secondary'>
                  {t('postTypes.priority.high')}
                </Badge>
              </div>
              <Typography variant='p' className='mb-3 text-muted-foreground'>
                {silverTier.description || t('postTypes.vipSilver.description')}
              </Typography>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('postTypes.duration')}:
                  </span>{' '}
                  <strong>
                    {silverTier.price30Days
                      ? '30'
                      : silverTier.price15Days
                        ? '15'
                        : '10'}{' '}
                    ngày
                  </strong>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('postTypes.price')}:
                  </span>{' '}
                  <strong className='text-gray-600'>
                    {formatPrice(
                      silverTier.price30Days ||
                        silverTier.price15Days ||
                        silverTier.price10Days,
                    )}{' '}
                    đ
                  </strong>
                </div>
              </div>
            </div>
          )}

          {normalTier && (
            <div className='p-4 border rounded-lg'>
              <div className='flex items-start justify-between mb-2'>
                <Typography variant='h4'>
                  {t('postTypes.regular.name')}
                </Typography>
                <Badge variant='outline'>
                  {t('postTypes.priority.normal')}
                </Badge>
              </div>
              <Typography variant='p' className='mb-3 text-muted-foreground'>
                {normalTier.description || t('postTypes.regular.description')}
              </Typography>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('postTypes.duration')}:
                  </span>{' '}
                  <strong>
                    {normalTier.price30Days
                      ? '30'
                      : normalTier.price15Days
                        ? '15'
                        : '10'}{' '}
                    ngày
                  </strong>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('postTypes.price')}:
                  </span>{' '}
                  <strong>
                    {formatPrice(
                      normalTier.price30Days ||
                        normalTier.price15Days ||
                        normalTier.price10Days,
                    )}{' '}
                    đ
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Additional Services */}
      <Card className='p-6'>
        <Typography variant='h3' className='mb-4'>
          {t('services.title')}
        </Typography>

        <div className='space-y-3'>
          <div className='flex items-center justify-between p-3 border rounded-lg'>
            <div>
              <Typography variant='p' className='font-medium'>
                {t('services.push.name')}
              </Typography>
              <Typography variant='small' className='text-muted-foreground'>
                {t('services.push.description')}
              </Typography>
            </div>
            <Typography variant='p' className='font-semibold text-primary'>
              {t('services.push.price')}
            </Typography>
          </div>

          <div className='flex items-center justify-between p-3 border rounded-lg'>
            <div>
              <Typography variant='p' className='font-medium'>
                {t('services.imageRights.name')}
              </Typography>
              <Typography variant='small' className='text-muted-foreground'>
                {t('services.imageRights.description')}
              </Typography>
            </div>
            <Typography variant='p' className='font-semibold text-primary'>
              {t('services.imageRights.price')}
            </Typography>
          </div>

          <div className='flex items-center justify-between p-3 border rounded-lg'>
            <div>
              <Typography variant='p' className='font-medium'>
                {t('services.schedule.name')}
              </Typography>
              <Typography variant='small' className='text-muted-foreground'>
                {t('services.schedule.description')}
              </Typography>
            </div>
            <Typography variant='p' className='font-semibold text-primary'>
              {t('services.schedule.price')}
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PricingGuideTemplate
