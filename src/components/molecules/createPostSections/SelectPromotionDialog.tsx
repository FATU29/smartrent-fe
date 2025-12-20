import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
import { Badge } from '@/components/atoms/badge'
import { useTranslations } from 'next-intl'
import {
  BenefitStatus,
  type UserBenefit,
  type UserMembership,
} from '@/api/types/membership.type'
import { Gift, Crown, Calendar, Check } from 'lucide-react'

interface SelectBenefitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (benefits: UserBenefit[]) => void
  selectedBenefitIds?: number[]
  membershipData?: UserMembership | null
}

export const SelectBenefitDialog: React.FC<SelectBenefitDialogProps> = ({
  open,
  onOpenChange,
  onApply,
  selectedBenefitIds = [],
  membershipData,
}) => {
  const t = useTranslations('createPost.sections.packageConfig.benefit')

  const [selected, setSelected] = useState<number | null>(
    selectedBenefitIds[0] || null,
  )

  const availableBenefits = useMemo(() => {
    if (!membershipData?.benefits) return []
    return membershipData?.benefits?.filter(
      (b) => b.quantityRemaining > 0 && b.status === BenefitStatus.ACTIVE,
    )
  }, [membershipData])

  const prevOpenRef = React.useRef(open)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSelected(selectedBenefitIds[0] || null)
    }
    prevOpenRef.current = open
  }, [open, selectedBenefitIds])

  const selectBenefit = useCallback((id: number) => {
    setSelected((prev) => (prev === id ? null : id))
  }, [])

  const handleApply = useCallback(() => {
    if (selected === null) {
      onApply([])
    } else {
      const selectedBenefit = availableBenefits.find(
        (b) => b.userBenefitId === selected,
      )
      onApply(selectedBenefit ? [selectedBenefit] : [])
    }
    onOpenChange(false)
  }, [selected, availableBenefits, onApply, onOpenChange])

  const renderMembershipInfo = () => {
    if (!membershipData) return null

    const expiryDate = new Date(membershipData.endDate).toLocaleDateString(
      'vi-VN',
    )
    const isExpiringSoon = membershipData.daysRemaining <= 7

    return (
      <Card className='p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mb-4'>
        <div className='flex items-start gap-3'>
          <div className='p-2 rounded-lg bg-primary/10'>
            <Crown className='w-5 h-5 text-primary' />
          </div>
          <div className='flex-1 space-y-1'>
            <div className='flex items-center gap-2'>
              <Typography className='font-semibold text-base'>
                {membershipData.packageName}
              </Typography>
              <Badge
                variant={
                  membershipData.status === 'ACTIVE' ? 'default' : 'secondary'
                }
                className='text-xs'
              >
                {membershipData.status === 'ACTIVE'
                  ? t('active')
                  : membershipData.status}
              </Badge>
            </div>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Calendar className='w-3 h-3' />
              <Typography variant='muted' className='text-xs'>
                {t('expires')}: {expiryDate}
                {isExpiringSoon && (
                  <span className='text-orange-600 ml-1'>
                    (
                    {t('daysRemaining', {
                      count: membershipData.daysRemaining,
                    })}
                    )
                  </span>
                )}
              </Typography>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const renderContent = () => {
    if (!membershipData) {
      return (
        <div className='flex flex-col items-center justify-center py-12 gap-3'>
          <Gift className='w-12 h-12 text-muted-foreground/50' />
          <Typography variant='muted' className='text-center'>
            {t('noMembership')}
          </Typography>
        </div>
      )
    }

    if (availableBenefits?.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-12 gap-3'>
          <Gift className='w-12 h-12 text-muted-foreground/50' />
          <Typography variant='muted' className='text-center'>
            {t('noBenefits')}
          </Typography>
        </div>
      )
    }

    return (
      <div className='space-y-3 max-h-[400px] overflow-y-auto pr-2'>
        {availableBenefits.map((benefit) => {
          const isSelected = selected === benefit.userBenefitId
          const expiresAt = new Date(benefit.expiresAt).toLocaleDateString(
            'vi-VN',
          )

          return (
            <Card
              key={benefit.userBenefitId}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => selectBenefit(benefit.userBenefitId)}
            >
              <div className='flex items-start gap-3'>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {isSelected && (
                    <Check className='w-3 h-3 text-primary-foreground' />
                  )}
                </div>
                <CardContent className='p-0 flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                      <Typography className='font-medium mb-1'>
                        {benefit.benefitNameDisplay}
                      </Typography>
                      <div className='flex flex-col gap-1'>
                        <Typography variant='muted' className='text-xs'>
                          {t('remaining', { count: benefit.quantityRemaining })}{' '}
                          / {benefit.totalQuantity}
                        </Typography>
                        <Typography
                          variant='muted'
                          className='text-xs flex items-center gap-1'
                        >
                          <Calendar className='w-3 h-3' />
                          {t('expires')}: {expiresAt}
                        </Typography>
                      </div>
                    </div>
                    <Badge variant='outline' className='text-xs shrink-0'>
                      {benefit.benefitType}
                    </Badge>
                  </div>
                </CardContent>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[min(92vw,640px)] max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto'>
          {renderMembershipInfo()}
          <div className='min-h-[120px]'>{renderContent()}</div>
        </div>
        <DialogFooter className='gap-2 pt-4 border-t'>
          <DialogClose asChild>
            <Button variant='outline'>{t('cancel')}</Button>
          </DialogClose>
          <Button onClick={handleApply} disabled={selected === null}>
            {t('apply', { count: selected === null ? 0 : 1 })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
