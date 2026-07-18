import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'
import ToggleChip from '@/components/atoms/mobileFilter/toggleChip'
import { Input } from '@/components/atoms/input'
// Location filter retired — the "Vị trí của bạn" toggle is hidden from the
// dialog. Import/handler kept commented so it can be re-enabled in one change.
// import LocationToggleChip from '@/components/atoms/mobileFilter/locationToggleChip'
import ToggleSection from '@/components/molecules/mobileFilter/toggleSection'
import { Button } from '@/components/atoms/button'
import {
  DollarSign,
  Ruler,
  Compass,
  Zap,
  Droplets,
  Wifi,
  ShieldCheck,
  BadgeCheck,
  Camera,
  MapPin,
  Home,
  Bed,
  Receipt,
  MapIcon,
  Tag,
  Hash,
} from 'lucide-react'
import { ListingFilterRequest } from '@/api/types'
import { LISTING_TYPE } from '@/api/types/property.type'
import { PUBLIC_ROUTES } from '@/constants/route'

interface MobileFilterMainViewProps {
  filters: ListingFilterRequest
  onNavigate: (view: string) => void
  onUpdate: (partial: Partial<ListingFilterRequest>) => void
  hideVerifiedFilter?: boolean
  hideBrokerFilter?: boolean
  hideViewMapButton?: boolean
  // Only meaningful for the owner's "My Listings" management view — the
  // public marketplace filter (homepage/residentialProperties) shares this
  // component and must not surface an internal listing-ID field to visitors.
  showListingIdFilter?: boolean
}

const MobileFilterMainView: React.FC<MobileFilterMainViewProps> = ({
  filters,
  onNavigate,
  onUpdate,
  hideVerifiedFilter = false,
  hideBrokerFilter = false,
  hideViewMapButton = false,
  showListingIdFilter = false,
}) => {
  const t = useTranslations('residentialFilter')

  const formatRange = (min?: number, max?: number, unit?: string) => {
    if (!min && !max) return t('summary.all')
    const parts: string[] = []
    if (min) parts.push(min.toLocaleString())
    parts.push('-')
    if (max) parts.push(max.toLocaleString())
    return parts.join(' ') + (unit ? ` ${unit}` : '')
  }

  // Location filter retired — handler kept commented alongside the import so
  // the "Vị trí của bạn" toggle can be re-enabled in one change.
  // const handleLocationChange = (
  //   userLatitude?: number,
  //   userLongitude?: number,
  // ) => {
  //   onUpdate({
  //     userLatitude: userLatitude,
  //     userLongitude: userLongitude,
  //   })
  // }

  return (
    <div className='pb-20'>
      {/* View Map Button */}
      {!hideViewMapButton && (
        <div className='p-4 pb-3'>
          <Link href={PUBLIC_ROUTES.MAPS} className='block'>
            <Button variant='secondary' className='w-full h-10' type='button'>
              <MapIcon className='h-4 w-4 mr-2' /> {t('actions.viewMap')}
            </Button>
          </Link>
        </div>
      )}

      {/* Exact listing ID — owner "My Listings" only, see showListingIdFilter */}
      {showListingIdFilter && (
        <div className='p-4 pb-2'>
          <ToggleSection
            icon={<Hash className='h-4 w-4 text-muted-foreground' />}
            title={t('fields.listingId')}
          >
            <Input
              type='text'
              inputMode='numeric'
              placeholder={t('fields.listingIdPlaceholder')}
              value={filters.id ?? ''}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, '')
                onUpdate({ id: digits ? Number(digits) : undefined })
              }}
              className='h-9'
            />
          </ToggleSection>
        </div>
      )}

      {/* Listing intent (Nhu cầu) — primary axis, shown inline at the top */}
      <div className='p-4 pb-2'>
        <ToggleSection
          icon={<Tag className='h-4 w-4 text-muted-foreground' />}
          title={t('toggles.listingType')}
        >
          <div className='flex flex-wrap gap-2'>
            <ToggleChip
              label={t('listingType.RENT')}
              active={filters.listingType === LISTING_TYPE.RENT}
              onClick={() =>
                onUpdate({
                  listingType:
                    filters.listingType === LISTING_TYPE.RENT
                      ? undefined
                      : LISTING_TYPE.RENT,
                })
              }
            />
            <ToggleChip
              label={t('listingType.SHARE')}
              active={filters.listingType === LISTING_TYPE.SHARE}
              onClick={() =>
                onUpdate({
                  listingType:
                    filters.listingType === LISTING_TYPE.SHARE
                      ? undefined
                      : LISTING_TYPE.SHARE,
                })
              }
            />
          </div>
        </ToggleSection>
      </div>

      <div className='space-y-1'>
        <RadioRow
          label={
            filters.provinceId || filters.districtId || filters.wardId
              ? `${t('dropdowns.address')} (${t('address.added')})`
              : `${t('dropdowns.address')} (${t('address.add')})`
          }
          selected={
            !!(filters.provinceId || filters.districtId || filters.wardId)
          }
          onClick={() => onNavigate('address')}
          iconLeft={<MapPin className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={t('dropdowns.propertyType')}
          selected={!!filters.productType}
          onClick={() => onNavigate('propertyType')}
          iconLeft={<Home className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={`${t('dropdowns.priceRange')} (${formatRange(filters.minPrice, filters.maxPrice, 'VND')})`}
          selected={!!(filters.minPrice || filters.maxPrice)}
          onClick={() => onNavigate('price')}
          iconLeft={<DollarSign className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={`${t('dropdowns.areaRange')} (${formatRange(filters.minArea, filters.maxArea, 'm²')})`}
          selected={!!(filters.minArea || filters.maxArea)}
          onClick={() => onNavigate('area')}
          iconLeft={<Ruler className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={`${t('dropdowns.bedroomRange')} (${formatRange(filters.minBedrooms, filters.maxBedrooms)})`}
          selected={!!(filters.minBedrooms || filters.maxBedrooms)}
          onClick={() => onNavigate('bedroom')}
          iconLeft={<Bed className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={t('dropdowns.orientation')}
          selected={!!filters.direction}
          onClick={() => onNavigate('direction')}
          iconLeft={<Compass className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={t('dropdowns.electricityPrice')}
          selected={!!filters.electricityPrice}
          onClick={() => onNavigate('electricityPrice')}
          iconLeft={<Zap className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={t('dropdowns.waterPrice')}
          selected={!!filters.waterPrice}
          onClick={() => onNavigate('waterPrice')}
          iconLeft={<Droplets className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={t('dropdowns.internetPrice')}
          selected={!!filters.internetPrice}
          onClick={() => onNavigate('internetPrice')}
          iconLeft={<Wifi className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={t('dropdowns.serviceFee')}
          selected={!!filters.serviceFee}
          onClick={() => onNavigate('serviceFee')}
          iconLeft={<Receipt className='h-4 w-4 text-muted-foreground' />}
        />
        <RadioRow
          label={`${t('amenities.title')} ${filters.amenityIds && filters.amenityIds.length > 0 ? `(${filters.amenityIds.length})` : ''}`}
          selected={!!(filters.amenityIds && filters.amenityIds.length > 0)}
          onClick={() => onNavigate('amenities')}
          iconLeft={<Camera className='h-4 w-4 text-muted-foreground' />}
        />
      </div>

      <div className='p-4 space-y-6'>
        {!hideBrokerFilter && (
          <ToggleSection
            icon={<BadgeCheck className='h-4 w-4 text-muted-foreground' />}
            title={t('toggles.professionalBroker')}
          >
            <ToggleChip
              label={t('toggles.professionalBroker')}
              active={filters.isBroker === true}
              onClick={() =>
                onUpdate({
                  isBroker: filters.isBroker === true ? undefined : true,
                })
              }
            />
          </ToggleSection>
        )}

        {!hideVerifiedFilter && (
          <ToggleSection
            icon={<ShieldCheck className='h-4 w-4 text-muted-foreground' />}
            title={t('toggles.verified')}
          >
            <ToggleChip
              label={t('toggles.verified')}
              active={!!filters.verified}
              onClick={() => onUpdate({ verified: !filters.verified })}
            />
          </ToggleSection>
        )}

        {/* Location filter retired — "Vị trí của bạn" toggle hidden from the
            dialog on all pages.
        <ToggleSection
          icon={<MapPin className='h-4 w-4 text-muted-foreground' />}
          title={t('toggles.location')}
        >
          <LocationToggleChip onLocationChange={handleLocationChange} />
        </ToggleSection>
        */}
      </div>
    </div>
  )
}

export default MobileFilterMainView
