import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Crown, Calendar, Gift, Loader2, ArrowRight } from 'lucide-react'
import { useMyMembership } from '@/hooks/useMembership'
import { useAuth } from '@/hooks/useAuth'
import { MembershipStatus, BenefitStatus } from '@/api/types/membership.type'
import { format } from 'date-fns'
import { Button } from '@/components/atoms/button'
import Link from 'next/link'

const DashboardMembershipCard: React.FC = () => {
  const t = useTranslations('seller.dashboard.membership')
  const { user } = useAuth()
  const { data: membership, isLoading } = useMyMembership(user?.userId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Crown className='h-5 w-5 text-primary' />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!membership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Crown className='h-5 w-5 text-primary' />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('noMembership')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href='/sellernet/membership/register'>
            <Button className='w-full' variant='default'>
              {t('upgradeNow')}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const isActive = membership.status === MembershipStatus.ACTIVE
  const activeBenefits = membership.benefits.filter(
    (benefit) => benefit.status === BenefitStatus.ACTIVE,
  )

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Crown className='h-5 w-5 text-primary' />
              {membership.packageName}
            </CardTitle>
            <CardDescription className='mt-1'>
              {t('packageLevel')}: {membership.packageLevel}
            </CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {membership.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Membership Period */}
        <div className='flex items-center gap-2 text-sm'>
          <Calendar className='h-4 w-4 text-muted-foreground' />
          <span className='text-muted-foreground'>
            {t('validUntil')}:{' '}
            <span className='font-medium text-foreground'>
              {format(new Date(membership.endDate), 'dd/MM/yyyy')}
            </span>
          </span>
        </div>

        {/* Days Remaining */}
        {isActive && membership.daysRemaining > 0 && (
          <div className='rounded-lg bg-muted p-3'>
            <div className='text-sm font-medium'>
              {t('daysRemaining')}: {membership.daysRemaining}
            </div>
          </div>
        )}

        {/* Active Benefits Summary */}
        {activeBenefits.length > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Gift className='h-4 w-4 text-primary' />
              {t('activeBenefits')} ({activeBenefits.length})
            </div>
            <div className='space-y-1'>
              {activeBenefits.slice(0, 3).map((benefit) => (
                <div
                  key={benefit.userBenefitId}
                  className='flex items-center justify-between text-sm'
                >
                  <span className='text-muted-foreground'>
                    {benefit.benefitNameDisplay}
                  </span>
                  <span className='font-medium'>
                    {benefit.quantityRemaining}/{benefit.totalQuantity}
                  </span>
                </div>
              ))}
              {activeBenefits.length > 3 && (
                <div className='text-xs text-muted-foreground'>
                  +{activeBenefits.length - 3} {t('moreBenefits')}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardMembershipCard
