import React from 'react'
import { useTranslations } from 'next-intl'
import { useCreatePost } from '@/contexts/createPost'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/atoms/card'
import { Separator } from '@/components/atoms/separator'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import PropertyCard from '@/components/molecules/propertyCard'
import { PropertyCard as PropertyCardType } from '@/api/types/property.type'
import { OrderSummaryRow } from '@/components/molecules/orderSummary/orderSummaryRow'
import { Calendar, Package, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderSummarySectionProps {
  className?: string
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  className,
}) => {
  const t = useTranslations('createPost.sections.orderSummary')
  const { propertyInfo } = useCreatePost()

  const getPackageName = (packageType?: string) => {
    switch (packageType) {
      case 'vip-diamond':
        return 'VIP Kim Cương'
      case 'vip-gold':
        return 'VIP Vàng'
      case 'vip-silver':
        return 'VIP Bạc'
      case 'standard':
        return 'Tin thường'
      default:
        return 'Chưa chọn'
    }
  }

  const getPackagePrice = (packageType?: string, duration?: number) => {
    if (!packageType || !duration) return 0

    const pricePerDay: Record<string, number> = {
      'vip-diamond': 280000,
      'vip-gold': 110000,
      'vip-silver': 50000,
      standard: 2700,
    }

    const durationPricePerDay: Record<number, number> = {
      10: 2700,
      15: 2400,
      30: 2200,
    }

    const basePrice = pricePerDay[packageType] || 0
    const adjustedPricePerDay =
      packageType === 'standard'
        ? durationPricePerDay[duration] || 2700
        : basePrice

    return adjustedPricePerDay * duration
  }

  const packagePrice = getPackageName(propertyInfo.selectedPackageType)
  const totalPrice = getPackagePrice(
    propertyInfo.selectedPackageType,
    propertyInfo.selectedDuration,
  )
  const vatAmount = totalPrice * 0.1
  const finalTotal = totalPrice + vatAmount

  // Create property object for PropertyCard
  const propertyData: PropertyCardType = {
    id: 'preview-property',
    title: propertyInfo.listingTitle || 'Tiêu đề bất động sản chưa có',
    description: propertyInfo.propertyDescription || '',
    address: propertyInfo.propertyAddress || '',
    city: '', // Not available in PropertyInfo yet
    property_type: propertyInfo.propertyType || '',
    bedrooms: propertyInfo.bedrooms || 0,
    bathrooms: propertyInfo.bathrooms || 0,
    price: propertyInfo.price || 0,
    currency: 'VND',
    images: propertyInfo.images?.map((img) => img.url) || [],
    area: propertyInfo.area,
    verified: false,
    featured: false,
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa chọn'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getEndDate = () => {
    if (!propertyInfo.packageStartDate || !propertyInfo.selectedDuration)
      return 'N/A'
    const startDate = new Date(propertyInfo.packageStartDate)
    const endDate = new Date(
      startDate.getTime() + propertyInfo.selectedDuration * 24 * 60 * 60 * 1000,
    )
    return endDate.toLocaleDateString('vi-VN')
  }

  return (
    <Card className={cn('border-0 shadow-none', className)}>
      <CardHeader className='px-0'>
        <CardTitle className='text-2xl sm:text-3xl lg:text-4xl'>
          {t('title')}
        </CardTitle>
        <CardDescription className='text-sm sm:text-base'>
          {t('description')}
        </CardDescription>
      </CardHeader>

      <CardContent className='px-0'>
        {/* Flex Layout: Left Content + Right Payment Summary */}
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Left Side - Main Content */}
          <div className='flex-1 space-y-6'>
            {/* Property Preview - Using existing PropertyCard component */}
            <PropertyCard className='h-fit' property={propertyData} />

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>{t('contactInfo')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <OrderSummaryRow
                  label={t('fullName')}
                  value={propertyInfo.fullName || 'Chưa có'}
                />
                <Separator />
                <OrderSummaryRow
                  label={t('email')}
                  value={propertyInfo.email || 'Chưa có'}
                />
                <Separator />
                <OrderSummaryRow
                  label={t('phone')}
                  value={propertyInfo.phoneNumber || 'Chưa có'}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Package & Payment Summary (Sticky) */}
          <Card className='lg:w-[380px] xl:w-[420px] h-fit lg:sticky lg:top-6 space-y-0'>
            {/* Package Details */}
            <CardHeader className='pb-4'>
              <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                <Package className='w-5 h-5 text-primary' />
                <CardTitle className='text-lg'>{t('packageDetails')}</CardTitle>
              </Card>
            </CardHeader>

            <CardContent className='space-y-3 pb-6'>
              <OrderSummaryRow
                label={t('packageType')}
                value={
                  <Badge variant='default' className='font-medium'>
                    {packagePrice}
                  </Badge>
                }
                variant='highlight'
              />
              <Separator />
              <OrderSummaryRow
                label={t('duration')}
                value={`${propertyInfo.selectedDuration || 0} ${t('days')}`}
              />
              <Separator />
              <OrderSummaryRow
                label={t('startDate')}
                value={
                  <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                    <Calendar className='w-4 h-4 text-muted-foreground' />
                    <Typography className='text-sm'>
                      {formatDate(propertyInfo.packageStartDate)}
                    </Typography>
                  </Card>
                }
              />
              <Separator />
              <OrderSummaryRow
                label={t('endDate')}
                value={
                  <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                    <Calendar className='w-4 h-4 text-muted-foreground' />
                    <Typography className='text-sm'>{getEndDate()}</Typography>
                  </Card>
                }
              />
            </CardContent>

            <Separator className='my-0' />

            {/* Price Breakdown */}
            <CardHeader className='pt-6 pb-4'>
              <Card className='flex items-center gap-2 border-0 shadow-none p-0'>
                <CreditCard className='w-5 h-5 text-primary' />
                <CardTitle className='text-lg'>{t('priceBreakdown')}</CardTitle>
              </Card>
            </CardHeader>

            <CardContent className='space-y-3'>
              <OrderSummaryRow
                label={t('packagePrice')}
                value={`${totalPrice.toLocaleString('vi-VN')} đ`}
              />
              <Separator />
              <OrderSummaryRow
                label={t('vat10')}
                value={`${vatAmount.toLocaleString('vi-VN')} đ`}
              />
              <Separator />
              <OrderSummaryRow
                label={t('discount')}
                value={
                  <Typography className='text-sm text-destructive'>
                    - 0 đ
                  </Typography>
                }
              />
              <Separator className='my-4' />
              <OrderSummaryRow
                label={t('totalAmount')}
                value={
                  <Card className='text-right border-0 shadow-none p-0'>
                    <Typography className='text-2xl font-bold text-primary'>
                      {finalTotal.toLocaleString('vi-VN')} đ
                    </Typography>
                    <Typography variant='muted' className='text-xs'>
                      {t('vatIncluded')}
                    </Typography>
                  </Card>
                }
                variant='total'
              />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export { OrderSummarySection }
export type { OrderSummarySectionProps }
