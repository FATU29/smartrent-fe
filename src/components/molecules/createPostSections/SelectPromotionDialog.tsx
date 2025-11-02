import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import { MembershipService } from '@/api/services/membership.service'
import type {
  BenefitType,
  GetMyMembershipResponse,
  UserBenefit,
} from '@/api/types/memembership.type'
import { useAuthStore } from '@/store/auth/index.store'

interface SelectPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (benefit: UserBenefit) => void
}

const POST_BENEFITS: BenefitType[] = [
  'POST_STANDARD',
  'POST_SILVER',
  'POST_GOLD',
] as unknown as BenefitType[]

export const SelectPromotionDialog: React.FC<SelectPromotionDialogProps> = ({
  open,
  onOpenChange,
  onApply,
}) => {
  const t = useTranslations('createPost.sections.packageConfig')
  const { user } = useAuthStore()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [membership, setMembership] =
    React.useState<GetMyMembershipResponse | null>(null)

  const load = React.useCallback(async () => {
    if (!user?.userId) {
      setError(t('noPromotionAvailable'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await MembershipService.getMyMembership(user.userId)
      if (res.success) {
        setMembership(res.data)
      } else {
        setError(t('noPromotionAvailable'))
      }
    } catch {
      setError(t('noPromotionAvailable'))
    } finally {
      setLoading(false)
    }
  }, [user?.userId, t])

  React.useEffect(() => {
    if (open) load()
  }, [open, load])

  const availableBenefits = React.useMemo(() => {
    const all = membership?.benefits || []
    return all.filter(
      (b) =>
        POST_BENEFITS.includes(b.benefitType) &&
        b.quantityRemaining > 0 &&
        b.status === 'ACTIVE',
    )
  }, [membership])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[min(92vw,560px)]'>
        <DialogHeader>
          <DialogTitle>{t('selectPromotion')}</DialogTitle>
          <DialogDescription>{t('selectPromotionDesc')}</DialogDescription>
        </DialogHeader>
        <div className='space-y-3 min-h-[120px]'>
          {loading && (
            <Typography variant='muted'>{t('loadingPromotions')}</Typography>
          )}
          {!loading && error && (
            <Typography variant='muted' className='text-center'>
              {t('noPromotionAvailable')}
            </Typography>
          )}
          {!loading && !error && availableBenefits.length === 0 && (
            <Typography variant='muted' className='text-center'>
              {t('noPromotionAvailable')}
            </Typography>
          )}
          {!loading && !error && availableBenefits.length > 0 && (
            <div className='space-y-3'>
              {availableBenefits.map((benefit) => (
                <Card
                  key={benefit.userBenefitId}
                  className='flex items-center justify-between p-3'
                >
                  <CardContent className='p-0'>
                    <Typography className='font-medium'>
                      {benefit.benefitNameDisplay}
                    </Typography>
                    <Typography variant='muted' className='text-xs'>
                      {t('remaining', { count: benefit.quantityRemaining })}
                    </Typography>
                  </CardContent>
                  <Button
                    size='sm'
                    onClick={() => {
                      onApply(benefit)
                      onOpenChange(false)
                    }}
                  >
                    {t('applyPromotion')}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>{t('close')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
