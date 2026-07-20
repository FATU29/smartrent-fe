import { SELLERNET_ROUTES } from '@/constants'
import React, { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'motion/react'
import { MembershipHeader } from './MembershipHeader'
import { MembershipPlansGrid } from './MembershipPlansGrid'
import UpgradeCard from '@/components/molecules/upgradeCard'
import UpgradePreviewModal from '@/components/molecules/upgradePreviewModal'
import type {
  PaymentProvider,
  Membership,
  UpgradePreview,
  UserMembership,
} from '@/api/types/membership.type'
import {
  canRenewMembership,
  getExpiryUrgency,
  MembershipStatus,
  QueuedMembershipExistsError,
} from '@/api/types/membership.type'
import { useDialog } from '@/hooks/useDialog'
import PaymentMethodDialog from '@/components/molecules/paymentMethodDialog'
import { useAuthContext } from '@/contexts/auth'
import {
  useMembershipPackages,
  usePurchaseMembership,
  useMyMembership,
  useAvailableUpgrades,
  useInitiateUpgrade,
  useInitiateRenewal,
} from '@/hooks/useMembership'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Award,
  Calendar,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MEDIA_BELOW_MD } from '@/constants/breakpoints'
import { Badge } from '@/components/atoms/badge'
import { Separator } from '@/components/atoms/separator'
import { Typography } from '@/components/atoms/typography'
import {
  getMembershipLevelIcon,
  getMembershipLevelTileClasses,
} from '@/components/molecules/pricingPlanCard'
import { cn } from '@/lib/utils'
import { MembershipPackageLevel } from '@/api/types/membership.type'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/atoms/tabs'
import { Button } from '@/components/atoms/button'
import { format } from 'date-fns'

const URGENCY_CARD_CLASSES = {
  none: '',
  warning:
    'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-600',
  danger:
    'border-orange-400 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-600',
  critical: 'border-red-400 bg-red-50 dark:bg-red-950/20 dark:border-red-600',
}

// Membership card keeps the neutral theme surface (bg-card) — only the
// border signals urgency, so the renewal tab doesn't read as a colored banner.
const URGENCY_BORDER_CLASSES = {
  none: '',
  warning: 'border-yellow-400 dark:border-yellow-600',
  danger: 'border-orange-400 dark:border-orange-600',
  critical: 'border-red-400 dark:border-red-600',
}

const URGENCY_BADGE_CLASSES = {
  none: '',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

// ─── RenewalTabContent ───────────────────────────────────────────────────────

interface RenewalTabContentProps {
  membership: UserMembership
  queued: UserMembership | null
  onRenewClick: () => void
  isRenewing: boolean
}

const RenewalTabContent: React.FC<RenewalTabContentProps> = ({
  membership,
  queued,
  onRenewClick,
  isRenewing,
}) => {
  const tPage = useTranslations('membershipPage')

  const urgency = getExpiryUrgency(membership.daysRemaining, membership.status)
  const membershipIcon = getMembershipLevelIcon(
    membership.packageLevel as MembershipPackageLevel,
  )
  const endDateFormatted = format(new Date(membership.endDate), 'dd/MM/yyyy')

  const isExpired = membership.status === MembershipStatus.EXPIRED

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className='max-w-2xl mx-auto space-y-4'
    >
      {/* Urgency info banner */}
      {urgency !== 'none' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border',
            URGENCY_CARD_CLASSES[urgency],
          )}
        >
          <Clock className='size-4 mt-0.5 flex-shrink-0' />
          <Typography variant='small'>
            {tPage(`renewal.urgencyInfo.${urgency}`)}
          </Typography>
        </motion.div>
      )}

      {/* Membership card */}
      <Card
        className={cn(
          'relative overflow-hidden border',
          urgency !== 'none'
            ? URGENCY_BORDER_CLASSES[urgency]
            : 'border-border',
        )}
      >
        <div className='absolute inset-x-0 top-0 h-px bg-primary/40' />
        <CardContent className='p-6 md:p-8 space-y-6'>
          {/* Header */}
          <div className='flex items-start gap-4'>
            <div
              className={cn(
                'flex items-center justify-center size-12 rounded-lg border flex-shrink-0',
                getMembershipLevelTileClasses(
                  membership.packageLevel as MembershipPackageLevel,
                ),
              )}
            >
              {membershipIcon || <Crown className='size-6' />}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 flex-wrap mb-1'>
                <Typography
                  variant='small'
                  className='text-xs font-medium uppercase tracking-wider text-muted-foreground'
                >
                  {tPage('renewal.currentPlanLabel')}
                </Typography>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    isExpired
                      ? URGENCY_BADGE_CLASSES.critical
                      : urgency !== 'none'
                        ? URGENCY_BADGE_CLASSES[urgency]
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  )}
                >
                  {isExpired
                    ? tPage('renewal.expiredBadge')
                    : tPage('renewal.daysRemainingBadge', {
                        count: membership.daysRemaining,
                      })}
                </span>
              </div>
              <Typography variant='h3' className='font-semibold'>
                {membership.packageName}
              </Typography>
              <div className='flex items-center gap-1.5 mt-1 text-muted-foreground'>
                <Sparkles className='size-3.5' />
                <Typography variant='small'>
                  {membership.packageLevel}
                </Typography>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details grid */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex items-center gap-3 p-3.5 rounded-lg bg-muted/40 border border-border'>
              <Calendar className='size-4 text-muted-foreground flex-shrink-0' />
              <div>
                <Typography
                  variant='small'
                  className='text-xs uppercase tracking-wider text-muted-foreground'
                >
                  {tPage('renewal.expiresOn', { date: '' }).replace(
                    '{date}',
                    '',
                  )}
                </Typography>
                <Typography
                  variant='small'
                  className='font-semibold text-foreground'
                >
                  {endDateFormatted}
                </Typography>
              </div>
            </div>
            <div className='flex items-center gap-3 p-3.5 rounded-lg bg-muted/40 border border-border'>
              <Award className='size-4 text-muted-foreground flex-shrink-0' />
              <div>
                <Typography
                  variant='small'
                  className='text-xs uppercase tracking-wider text-muted-foreground'
                >
                  {tPage('renewal.priceLabel')}
                </Typography>
                <Typography
                  variant='small'
                  className='font-semibold text-foreground'
                >
                  {membership.totalPaid.toLocaleString('vi-VN')}đ
                </Typography>
              </div>
            </div>
          </div>

          {queued ? (
            /* Already has a queued slot — renewal is not allowed until it activates */
            <div className='flex items-start gap-2.5 p-3.5 rounded-lg bg-muted/40 border border-border'>
              <RefreshCw className='size-4 text-muted-foreground mt-0.5 flex-shrink-0' />
              <div className='space-y-0.5'>
                <Typography variant='small' className='font-semibold'>
                  {queued.packageName}
                </Typography>
                <Typography variant='small' className='text-muted-foreground'>
                  {tPage('renewal.alreadyQueuedNote', {
                    date: format(new Date(queued.startDate), 'dd/MM/yyyy'),
                  })}
                </Typography>
              </div>
            </div>
          ) : (
            <>
              {/* Renewal note */}
              <div className='flex items-start gap-2.5 p-3.5 rounded-lg bg-primary/5 border border-primary/15'>
                <CheckCircle2 className='size-4 text-primary mt-0.5 flex-shrink-0' />
                <Typography variant='small' className='text-muted-foreground'>
                  {tPage('renewal.renewalNote')}
                </Typography>
              </div>

              {/* CTA */}
              <Button
                onClick={onRenewClick}
                disabled={isRenewing}
                size='lg'
                className='w-full gap-2'
              >
                <RefreshCw
                  className={cn('size-4', isRenewing && 'animate-spin')}
                />
                {isRenewing
                  ? tPage('renewal.renewButtonLoading')
                  : tPage('renewal.renewButton')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Main Template ───────────────────────────────────────────────────────────

export const MembershipRegisterTemplate: React.FC = () => {
  const tPage = useTranslations('membershipPage')
  const tUpgrade = useTranslations('membershipUpgrade')
  const router = useRouter()

  const [membershipId, setMembershipId] = useState<number | null>(null)
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradePreview | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState<
    'renewal' | 'upgrade' | 'purchase'
  >('purchase')
  const { user } = useAuthContext()

  const {
    open: openDialog,
    handleOpen: handleOpenPayment,
    handleClose: handleClosePayment,
  } = useDialog()

  const {
    open: openPreviewDialog,
    handleOpen: handleOpenPreview,
    handleClose: handleClosePreview,
  } = useDialog()

  const isMobile = useMediaQuery(MEDIA_BELOW_MD)

  const {
    data: memberships = [],
    isLoading: membershipLoading,
    error: membershipError,
  } = useMembershipPackages()

  const { data: myMembership, isLoading: checkingMembership } = useMyMembership(
    user?.userId,
  )
  const currentMembership = myMembership?.current ?? null
  const queuedMembership = myMembership?.queued ?? null

  const {
    data: upgrades = [],
    isLoading: upgradesLoading,
    error: upgradesError,
  } = useAvailableUpgrades(user?.userId)

  const purchaseMutation = usePurchaseMembership()
  const initiateMutation = useInitiateUpgrade()
  const renewalMutation = useInitiateRenewal()

  // Derive display mode
  const hasMembership = !!currentMembership
  const canRenew = canRenewMembership(currentMembership, queuedMembership)
  // All upgrade options share the same context: "QUEUED" when the user has a
  // queued slot (upgrade targets it, current stays untouched), "CURRENT" otherwise.
  const upgradeContext = upgrades[0]?.upgradeContext ?? 'CURRENT'
  const isLoading = checkingMembership || membershipLoading || upgradesLoading
  const hasError = membershipError || upgradesError

  // Set default tab when membership state is known (only on first load)
  React.useEffect(() => {
    if (checkingMembership) return
    if (!hasMembership) {
      setActiveTab('purchase')
    } else if (canRenew) {
      setActiveTab('renewal')
    } else {
      setActiveTab('upgrade')
    }
  }, [checkingMembership, hasMembership, canRenew])

  // ── Purchase flow ──
  const handlePurchaseSelectMethod = useCallback(
    async (provider: PaymentProvider) => {
      if (!membershipId || !user?.userId) {
        toast.error(tPage('errors.loginRequired'))
        return
      }

      try {
        const selectedMembership = memberships.find(
          (m: Membership) => m.membershipId === membershipId,
        )

        sessionStorage.removeItem('pendingListingCreation')

        if (selectedMembership) {
          sessionStorage.setItem(
            'pendingMembership',
            JSON.stringify({
              membershipId: selectedMembership.membershipId,
              packageName: selectedMembership.packageName,
              packageLevel: selectedMembership.packageLevel,
              salePrice: selectedMembership.salePrice,
              originalPrice: selectedMembership.originalPrice,
              durationMonths: selectedMembership.durationMonths,
              discountPercentage: selectedMembership.discountPercentage,
              benefits: selectedMembership.benefits,
            }),
          )
        }

        await purchaseMutation.mutateAsync({
          request: { membershipId, paymentProvider: provider },
          userId: user.userId,
        })

        handleClosePayment()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : tPage('errors.purchaseFailed'),
        )
      }
    },
    [
      membershipId,
      user?.userId,
      handleClosePayment,
      purchaseMutation,
      tPage,
      memberships,
    ],
  )

  // ── Upgrade flow ──
  const handleSelectUpgrade = useCallback(
    (upgrade: UpgradePreview) => {
      setSelectedUpgrade(upgrade)
      handleOpenPreview()
    },
    [handleOpenPreview],
  )

  const handleConfirmPreview = useCallback(() => {
    handleClosePreview()
    handleOpenPayment()
  }, [handleClosePreview, handleOpenPayment])

  const handleUpgradeSelectMethod = useCallback(
    async (provider: PaymentProvider) => {
      if (!user?.userId || !selectedUpgrade?.targetMembershipId) {
        toast.error(tUpgrade('errors.invalidSelection'))
        return
      }

      try {
        sessionStorage.removeItem('pendingListingCreation')
        sessionStorage.removeItem('pendingMembership')

        if (selectedUpgrade) {
          sessionStorage.setItem(
            'pendingMembershipUpgrade',
            JSON.stringify({
              targetMembershipId: selectedUpgrade.targetMembershipId,
              targetPackageName: selectedUpgrade.targetPackageName,
              targetPackageLevel: selectedUpgrade.targetPackageLevel,
              currentMembershipId: selectedUpgrade.currentMembershipId,
              currentPackageName: selectedUpgrade.currentPackageName,
              discountAmount: selectedUpgrade.discountAmount,
              finalPrice: selectedUpgrade.finalPrice,
              transactionRef: null,
            }),
          )
        }

        const result = await initiateMutation.mutateAsync({
          request: {
            targetMembershipId: selectedUpgrade.targetMembershipId,
            paymentProvider: provider,
          },
          userId: user.userId,
        })

        if (result.status === 'COMPLETED') {
          sessionStorage.removeItem('pendingMembershipUpgrade')
          toast.success(result.message)
          handleClosePayment()
          router.push(SELLERNET_ROUTES.PREFIX + '/membership')
        }
      } catch (error) {
        sessionStorage.removeItem('pendingMembershipUpgrade')
        toast.error(
          error instanceof Error
            ? error.message
            : tUpgrade('errors.upgradeFailed'),
        )
      }
    },
    [
      selectedUpgrade,
      user?.userId,
      handleClosePayment,
      initiateMutation,
      tUpgrade,
      router,
    ],
  )

  // ── Renewal flow ──
  const handleRenewalSelectMethod = useCallback(
    async (provider: PaymentProvider) => {
      if (!user?.userId) {
        toast.error(tPage('errors.loginRequired'))
        return
      }

      try {
        sessionStorage.removeItem('pendingListingCreation')
        sessionStorage.removeItem('pendingMembership')

        await renewalMutation.mutateAsync({
          request: { paymentProvider: provider },
          userId: user.userId,
        })

        handleClosePayment()
      } catch (error) {
        toast.error(
          error instanceof QueuedMembershipExistsError
            ? tPage('errors.queuedExists')
            : error instanceof Error
              ? error.message
              : tPage('errors.renewalFailed'),
        )
      }
    },
    [user?.userId, handleClosePayment, renewalMutation, tPage],
  )

  const handlePlanSelect = useCallback(
    async (id: number) => {
      setMembershipId(id)
      handleOpenPayment()
    },
    [handleOpenPayment],
  )

  // ── Upgrade grid ──
  const renderUpgradeGrid = () => {
    if (upgrades.length === 0) {
      const membershipIcon = currentMembership
        ? getMembershipLevelIcon(
            currentMembership.packageLevel as MembershipPackageLevel,
          )
        : null

      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className='max-w-4xl mx-auto'
        >
          <Card className='relative overflow-hidden border-border'>
            <div className='absolute inset-x-0 top-0 h-px bg-primary/40' />
            <CardContent className='relative p-8 md:p-10'>
              <div className='flex flex-col md:flex-row gap-8'>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
                  className='flex-1 space-y-6'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0'>
                      <div
                        className={cn(
                          'flex items-center justify-center size-12 rounded-lg border',
                          currentMembership
                            ? getMembershipLevelTileClasses(
                                currentMembership.packageLevel as MembershipPackageLevel,
                              )
                            : 'bg-primary/10 border-primary/15 text-primary',
                        )}
                      >
                        {membershipIcon || <Crown className='size-6' />}
                      </div>
                    </div>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <Typography
                          variant='small'
                          className='text-xs font-medium uppercase tracking-wider text-muted-foreground'
                        >
                          {tUpgrade('currentMembership.title')}
                        </Typography>
                        <Badge
                          variant='secondary'
                          className='gap-1.5 px-2 py-0.5 text-xs font-medium'
                        >
                          <CheckCircle2 className='size-3' />
                          {tPage('currentPlan')}
                        </Badge>
                      </div>
                      {currentMembership && (
                        <>
                          <Typography variant='h3'>
                            {currentMembership.packageName}
                          </Typography>
                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <Sparkles className='size-4' />
                            <Typography variant='small'>
                              {tPage('packageLevel')}:{' '}
                              <span className='font-medium text-foreground'>
                                {currentMembership.packageLevel}
                              </span>
                            </Typography>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {currentMembership && (
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3 p-4 rounded-lg bg-muted/40 border border-border'>
                        <div className='flex items-center justify-center size-10 rounded-md bg-background border border-border text-muted-foreground'>
                          <Calendar className='size-5' />
                        </div>
                        <div className='flex-1'>
                          <Typography
                            variant='small'
                            className='text-xs uppercase tracking-wider text-muted-foreground'
                          >
                            {tPage('daysRemaining')}
                          </Typography>
                          <Typography
                            variant='h3'
                            className='font-semibold text-foreground'
                          >
                            {currentMembership.daysRemaining}{' '}
                            <span className='text-base font-normal text-muted-foreground'>
                              {tPage('days')}
                            </span>
                          </Typography>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 p-4 rounded-lg bg-muted/40 border border-border'>
                        <div className='flex items-center justify-center size-10 rounded-md bg-background border border-border text-muted-foreground'>
                          <Award className='size-5' />
                        </div>
                        <div className='flex-1'>
                          <Typography
                            variant='small'
                            className='text-xs uppercase tracking-wider text-muted-foreground'
                          >
                            {tPage('status')}
                          </Typography>
                          <Typography
                            variant='h3'
                            className='font-semibold text-foreground'
                          >
                            {currentMembership.status}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
                  className='flex-1 flex flex-col justify-center space-y-6'
                >
                  <div className='text-center space-y-4'>
                    <div className='flex justify-center'>
                      <div className='flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/15'>
                        <TrendingUp className='size-8' />
                      </div>
                    </div>
                    <Typography
                      variant='h3'
                      className='font-semibold text-foreground'
                    >
                      {tUpgrade('noUpgrades.title')}
                    </Typography>
                  </div>

                  <Separator />

                  <div className='space-y-2'>
                    <div className='flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card'>
                      <CheckCircle2 className='size-4 text-primary flex-shrink-0' />
                      <Typography variant='small' className='text-foreground'>
                        {tUpgrade('noUpgrades.info1')}
                      </Typography>
                    </div>
                    <div className='flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card'>
                      <Award className='size-4 text-primary flex-shrink-0' />
                      <Typography variant='small' className='text-foreground'>
                        {tUpgrade('noUpgrades.info2')}
                      </Typography>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    if (isMobile) {
      return (
        <motion.div
          className='relative'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Carousel opts={{ align: 'start', loop: false }} className='w-full'>
            <CarouselContent className='-ml-2'>
              {upgrades.map((upgrade, index) => (
                <CarouselItem
                  key={upgrade.targetMembershipId}
                  className='pl-2 basis-full'
                >
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className='h-full'
                  >
                    <UpgradeCard
                      upgrade={upgrade}
                      onUpgrade={() => handleSelectUpgrade(upgrade)}
                    />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>
      )
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
    }

    const itemVariants = {
      hidden: { opacity: 0, y: 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' as const },
      },
    }

    return (
      <motion.div
        className='flex flex-wrap justify-center gap-6'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {upgrades.map((upgrade) => (
          <motion.div
            key={upgrade.targetMembershipId}
            variants={itemVariants}
            className='flex w-full md:w-[calc(50%_-_0.75rem)] xl:w-[calc(33.333%_-_1rem)] max-w-md'
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <UpgradeCard
              upgrade={upgrade}
              onUpgrade={() => handleSelectUpgrade(upgrade)}
            />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // ── Loading / Error ──
  if (isLoading) {
    return (
      <div className='flex flex-col gap-8'>
        <Card>
          <CardContent className='p-6'>
            <Skeleton className='h-8 w-48 mb-4' />
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-3/4' />
          </CardContent>
        </Card>
        <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className='h-full'>
              <CardContent className='p-6 space-y-4'>
                <Skeleton className='h-12 w-12 rounded-full' />
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-10 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertCircle className='size-4' />
          <AlertTitle>
            {hasMembership
              ? tUpgrade('errors.loadFailedTitle')
              : tPage('errors.loadFailed')}
          </AlertTitle>
          <AlertDescription>
            {hasError instanceof Error
              ? hasError.message
              : tPage('errors.loadFailed')}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // ── Purchase-only mode (no current membership) ──
  if (!hasMembership) {
    return (
      <>
        <div className='flex flex-col gap-8'>
          <AnimatePresence mode='wait'>
            <motion.div
              key='purchase-header'
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <MembershipHeader
                title={tPage('title')}
                subtitle={tPage('subtitle')}
              />
            </motion.div>
          </AnimatePresence>

          {queuedMembership && (
            <Alert>
              <Clock className='size-4' />
              <AlertTitle>{tPage('queued.title')}</AlertTitle>
              <AlertDescription>
                {tPage('queued.activatesOn', {
                  date: format(
                    new Date(queuedMembership.startDate),
                    'dd/MM/yyyy',
                  ),
                })}{' '}
                — {queuedMembership.packageName}
              </AlertDescription>
            </Alert>
          )}

          <motion.div
            key='purchase-content'
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <MembershipPlansGrid
              loading={membershipLoading}
              memberships={memberships}
              onPlanSelect={handlePlanSelect}
            />
          </motion.div>
        </div>

        <PaymentMethodDialog
          open={openDialog}
          onOpenChange={handleClosePayment}
          onSelectMethod={handlePurchaseSelectMethod}
        />
      </>
    )
  }

  // ── Membership exists: show tabs ──
  // Tabs to show: always show upgrade tab; show renewal tab if eligible for
  // renewal, or if there's already a queued slot to display info about.
  const showRenewalTab = canRenew || !!queuedMembership

  const handlePaymentMethod = (provider: PaymentProvider) => {
    if (activeTab === 'renewal') return handleRenewalSelectMethod(provider)
    if (activeTab === 'upgrade') return handleUpgradeSelectMethod(provider)
    return handlePurchaseSelectMethod(provider)
  }

  // Tells the user upfront whether the upgrade they're about to pick targets
  // the queued slot (current untouched) or replaces the current slot immediately.
  const upgradeContextBanner = upgrades.length > 0 && (
    <Alert className='max-w-3xl mx-auto' variant='default'>
      <ArrowRight className='size-4' />
      <AlertTitle>
        {upgradeContext === 'QUEUED'
          ? tUpgrade('context.queuedBanner.title')
          : tUpgrade('context.currentBanner.title')}
      </AlertTitle>
      <AlertDescription>
        {upgradeContext === 'QUEUED'
          ? tUpgrade('context.queuedBanner.description', {
              date: queuedMembership
                ? format(new Date(queuedMembership.startDate), 'dd/MM/yyyy')
                : '',
            })
          : tUpgrade('context.currentBanner.description')}
      </AlertDescription>
    </Alert>
  )

  return (
    <>
      <div className='flex flex-col gap-8'>
        <AnimatePresence mode='wait'>
          <motion.div
            key='has-membership-header'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <MembershipHeader
              title={
                activeTab === 'renewal'
                  ? tPage('renewal.title')
                  : tUpgrade('title')
              }
              subtitle={
                activeTab === 'renewal'
                  ? tPage('renewal.subtitle', {
                      packageName: currentMembership?.packageName ?? '',
                    })
                  : tUpgrade('subtitle')
              }
            />
          </motion.div>
        </AnimatePresence>

        {showRenewalTab ? (
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab(v as 'renewal' | 'upgrade' | 'purchase')
            }
          >
            <TabsList className='w-full max-w-sm'>
              <TabsTrigger value='renewal' className='flex-1 gap-1.5'>
                <RefreshCw className='size-3.5' />
                {tPage('tabs.renewal')}
              </TabsTrigger>
              <TabsTrigger value='upgrade' className='flex-1 gap-1.5'>
                <ArrowRight className='size-3.5' />
                {tPage('tabs.membership')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='renewal' className='mt-6'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key='renewal-content'
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {currentMembership ? (
                    <RenewalTabContent
                      membership={currentMembership}
                      queued={queuedMembership}
                      onRenewClick={handleOpenPayment}
                      isRenewing={renewalMutation.isPending}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value='upgrade' className='mt-6 flex flex-col gap-6'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key='upgrade-content'
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className='flex flex-col gap-6'
                >
                  {upgradeContextBanner}
                  {renderUpgradeGrid()}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        ) : (
          <AnimatePresence mode='wait'>
            <motion.div
              key='upgrade-only'
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className='flex flex-col gap-6'
            >
              {upgradeContextBanner}
              {renderUpgradeGrid()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {activeTab === 'upgrade' && (
        <UpgradePreviewModal
          open={openPreviewDialog}
          preview={selectedUpgrade}
          onConfirm={handleConfirmPreview}
          onCancel={handleClosePreview}
          isLoading={initiateMutation.isPending}
        />
      )}

      <PaymentMethodDialog
        open={openDialog}
        onOpenChange={handleClosePayment}
        onSelectMethod={handlePaymentMethod}
      />
    </>
  )
}

export default MembershipRegisterTemplate
