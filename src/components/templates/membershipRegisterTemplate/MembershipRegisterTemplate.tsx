import React, { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { MembershipHeader } from './MembershipHeader'
import { MembershipPlansGrid } from './MembershipPlansGrid'
import UpgradeCard from '@/components/molecules/upgradeCard'
import UpgradePreviewModal from '@/components/molecules/upgradePreviewModal'
import type {
  PaymentProvider,
  Membership,
  UpgradePreview,
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
} from '@/hooks/useMembership'
import { toast } from 'sonner'
import { redirectToPayment } from '@/utils/payment'
import { Card, CardContent } from '@/components/atoms/card'
import { Skeleton } from '@/components/atoms/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/alert'
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Sparkles,
  Award,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Badge } from '@/components/atoms/badge'
import { Separator } from '@/components/atoms/separator'
import { Typography } from '@/components/atoms/typography'
import { getMembershipLevelIcon } from '@/components/molecules/pricingPlanCard'
import { MembershipPackageLevel } from '@/api/types/membership.type'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/atoms/carousel'

export const MembershipRegisterTemplate: React.FC = () => {
  const tPage = useTranslations('membershipPage')
  const tUpgrade = useTranslations('membershipUpgrade')
  const router = useRouter()

  const [membershipId, setMembershipId] = useState<number | null>(null)
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradePreview | null>(
    null,
  )
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

  const isTabletOrBelow = useMediaQuery('(max-width: 1279px)')
  const isMobile = useMediaQuery('(max-width: 767px)')

  //Init use hook
  const {
    data: memberships = [],
    isLoading: membershipLoading,
    error: membershipError,
  } = useMembershipPackages()

  const { data: currentMembership, isLoading: checkingMembership } =
    useMyMembership(user?.userId)

  const {
    data: upgrades = [],
    isLoading: upgradesLoading,
    error: upgradesError,
  } = useAvailableUpgrades(user?.userId)

  const purchaseMutation = usePurchaseMembership()
  const initiateMutation = useInitiateUpgrade()

  // Determine if showing purchase or upgrade mode
  const isUpgradeMode = !!currentMembership
  const isLoading = checkingMembership || membershipLoading || upgradesLoading
  const hasError = membershipError || upgradesError

  //Init event handle
  // Purchase flow handlers
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

        const result = await purchaseMutation.mutateAsync({
          request: {
            membershipId: membershipId,
            paymentProvider: provider,
          },
          userId: user.userId,
        })

        if (result.paymentUrl) {
          redirectToPayment(result.paymentUrl)
        } else {
          toast.success(tPage('success.purchaseSuccess'))
        }

        handleClosePayment()
      } catch (error) {
        console.error('Purchase failed:', error)
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

  // Upgrade flow handlers
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
        // Clear any previous payment session storage
        sessionStorage.removeItem('pendingListingCreation')
        sessionStorage.removeItem('pendingMembership')

        // Store upgrade info in session storage before redirect
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
              transactionRef: null, // Will be set after API call
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
          // Free upgrade - clear storage and show success
          sessionStorage.removeItem('pendingMembershipUpgrade')
          toast.success(result.message)
          handleClosePayment()
          router.push('/sellernet/membership')
        } else if (result.paymentUrl) {
          // Update storage with transaction ref
          const storedUpgrade = sessionStorage.getItem(
            'pendingMembershipUpgrade',
          )
          if (storedUpgrade) {
            try {
              const parsed = JSON.parse(storedUpgrade)
              parsed.transactionRef = result.transactionRef
              sessionStorage.setItem(
                'pendingMembershipUpgrade',
                JSON.stringify(parsed),
              )
            } catch (error) {
              console.error('Error updating upgrade storage:', error)
            }
          }
          // Will auto-redirect to payment URL via mutation
        }
      } catch (error) {
        // Clear storage on error
        sessionStorage.removeItem('pendingMembershipUpgrade')
        console.error('Upgrade failed:', error)
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

  const handlePlanSelect = useCallback(
    async (membershipId: number) => {
      setMembershipId(membershipId)
      handleOpenPayment()
    },
    [handleOpenPayment],
  )

  //Init util function
  const renderUpgradeGrid = () => {
    if (upgrades.length === 0) {
      const membershipIcon = currentMembership
        ? getMembershipLevelIcon(
            currentMembership.packageLevel as MembershipPackageLevel,
          )
        : null

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          className='max-w-4xl mx-auto'
        >
          <Card className='relative overflow-hidden border-2 border-primary/20 shadow-lg bg-card'>
            <CardContent className='p-8 md:p-10'>
              <div className='flex flex-col md:flex-row gap-8'>
                {/* Left Side - Current Membership Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className='flex-1 space-y-6'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0'>
                      <div className='flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/30 shadow-lg'>
                        {membershipIcon || (
                          <Crown className='size-8 text-primary' />
                        )}
                      </div>
                    </div>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Typography variant='h3' className='font-bold'>
                          {tUpgrade('currentMembership.title')}
                        </Typography>
                        <Badge
                          variant='default'
                          className='bg-green-500 hover:bg-green-600 text-white'
                        >
                          <CheckCircle2 className='size-3 mr-1' />
                          {tPage('currentPlan')}
                        </Badge>
                      </div>
                      {currentMembership && (
                        <>
                          <Typography
                            variant='large'
                            className='font-semibold text-foreground'
                          >
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

                  {/* Membership Details */}
                  {currentMembership && (
                    <div className='space-y-4'>
                      <div className='flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'>
                        <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30'>
                          <Calendar className='size-6 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div className='flex-1'>
                          <Typography
                            variant='small'
                            className='text-muted-foreground'
                          >
                            {tPage('daysRemaining')}
                          </Typography>
                          <Typography
                            variant='h3'
                            className='font-bold text-blue-600 dark:text-blue-400'
                          >
                            {currentMembership.daysRemaining}{' '}
                            <span className='text-lg font-normal text-muted-foreground'>
                              {tPage('days')}
                            </span>
                          </Typography>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'>
                        <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30'>
                          <Award className='size-6 text-amber-600 dark:text-amber-400' />
                        </div>
                        <div className='flex-1'>
                          <Typography
                            variant='small'
                            className='text-muted-foreground'
                          >
                            {tPage('status')}
                          </Typography>
                          <Typography
                            variant='p'
                            className='font-semibold text-foreground'
                          >
                            {currentMembership.status}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Right Side - No Upgrade Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className='flex-1 flex flex-col justify-center space-y-6'
                >
                  <div className='text-center space-y-4'>
                    <div className='flex justify-center'>
                      <div className='flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 shadow-lg'>
                        <TrendingUp className='size-10 text-primary' />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Typography
                        variant='h3'
                        className='font-bold text-foreground'
                      >
                        {tUpgrade('noUpgrades.title')}
                      </Typography>
                      <Typography
                        variant='p'
                        className='text-muted-foreground max-w-md mx-auto'
                      >
                        {tUpgrade('noUpgrades.message')}
                      </Typography>
                    </div>
                  </div>

                  <Separator />

                  {/* Info Points */}
                  <div className='space-y-3'>
                    <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
                      <div className='flex-shrink-0 mt-0.5'>
                        <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30'>
                          <CheckCircle2 className='size-4 text-green-600 dark:text-green-400' />
                        </div>
                      </div>
                      <div>
                        <Typography
                          variant='small'
                          className='font-medium text-foreground'
                        >
                          {tUpgrade('noUpgrades.info1')}
                        </Typography>
                        <Typography
                          variant='small'
                          className='text-muted-foreground'
                        >
                          {tUpgrade('noUpgrades.info1Desc')}
                        </Typography>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
                      <div className='flex-shrink-0 mt-0.5'>
                        <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                          <Award className='size-4 text-blue-600 dark:text-blue-400' />
                        </div>
                      </div>
                      <div>
                        <Typography
                          variant='small'
                          className='font-medium text-foreground'
                        >
                          {tUpgrade('noUpgrades.info2')}
                        </Typography>
                        <Typography
                          variant='small'
                          className='text-muted-foreground'
                        >
                          {tUpgrade('noUpgrades.info2Desc')}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    // Tablet and below: Carousel
    if (isTabletOrBelow) {
      return (
        <motion.div
          className={isMobile ? 'relative' : 'relative px-12'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Carousel
            opts={{
              align: 'start',
              loop: false,
            }}
            className='w-full'
          >
            <CarouselContent className='-ml-2 md:-ml-4'>
              {upgrades.map((upgrade, index) => (
                <CarouselItem
                  key={upgrade.targetMembershipId}
                  className='pl-2 md:pl-4 basis-full md:basis-[90%] lg:basis-[85%]'
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
            {!isMobile && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </motion.div>
      )
    }

    // Desktop: Grid with stagger animation
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }

    const itemVariants = {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 100,
          damping: 15,
        },
      },
    }

    return (
      <motion.div
        className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {upgrades.map((upgrade) => (
          <motion.div
            key={upgrade.targetMembershipId}
            variants={itemVariants}
            className='flex w-full'
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
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

  //Render
  // Show loading
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
            {isUpgradeMode
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

  return (
    <>
      <div className='flex flex-col gap-8'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={isUpgradeMode ? 'upgrade' : 'purchase'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <MembershipHeader
              title={isUpgradeMode ? tUpgrade('title') : tPage('title')}
              subtitle={
                isUpgradeMode ? tUpgrade('subtitle') : tPage('subtitle')
              }
            />
          </motion.div>
        </AnimatePresence>

        {isUpgradeMode && currentMembership && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Alert className='max-w-4xl mx-auto'>
              <CheckCircle2 className='size-4 text-green-500' />
              <AlertTitle>{tUpgrade('currentMembership.title')}</AlertTitle>
              <AlertDescription>
                {tUpgrade('currentMembership.message', {
                  planName: currentMembership.packageName,
                  daysRemaining: currentMembership.daysRemaining,
                })}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <AnimatePresence mode='wait'>
          {isUpgradeMode ? (
            <motion.div
              key='upgrade-content'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderUpgradeGrid()}
            </motion.div>
          ) : (
            <motion.div
              key='purchase-content'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MembershipPlansGrid
                loading={membershipLoading}
                memberships={memberships}
                onPlanSelect={handlePlanSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isUpgradeMode && (
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
        onSelectMethod={
          isUpgradeMode ? handleUpgradeSelectMethod : handlePurchaseSelectMethod
        }
      />
    </>
  )
}

export default MembershipRegisterTemplate
