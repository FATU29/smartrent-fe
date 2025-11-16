import React from 'react'
import { useTranslations } from 'next-intl'
import RadioRow from '@/components/atoms/mobileFilter/radioRow'
import ToggleChip from '@/components/atoms/mobileFilter/toggleChip'
import LocationToggleChip from '@/components/atoms/mobileFilter/locationToggleChip'
import ToggleSection from '@/components/molecules/mobileFilter/toggleSection'
import {
  DollarSign,
  Ruler,
  Compass,
  Zap,
  Droplets,
  Wifi,
  ShieldCheck,
  Video,
  Camera,
  MapPin,
} from 'lucide-react'
import { ListFilters } from '@/contexts/list/index.type'

// MobileFilterMainView
// Acts as the hub view listing all available filter categories and quick toggle flags.
// Delegates navigation upward via onNavigate(viewKey).
// Shows lightweight summaries (ranges, counts, media flags) inline to reduce drill-ins.
interface MobileFilterMainViewProps {
  filters: ListFilters
  onNavigate: (view: string) => void
  onUpdate: (partial: Partial<ListFilters>) => void
}

const MobileFilterMainView: React.FC<MobileFilterMainViewProps> = ({
  filters,
  onNavigate,
  onUpdate,
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

  return (
    <div className='pb-20'>
      <div className='space-y-1'>
        <RadioRow
          label={
            filters.provinceId ||
            filters.districtId ||
            filters.wardId ||
            filters.provinceCode ||
            filters.newWardCode ||
            filters.searchAddress
              ? `${t('dropdowns.address')} (${t('address.added')})`
              : `${t('dropdowns.address')} (${t('address.add')})`
          }
          selected={
            !!(
              filters.provinceId ||
              filters.districtId ||
              filters.wardId ||
              filters.provinceCode ||
              filters.newWardCode ||
              filters.searchAddress
            )
          }
          onClick={() => onNavigate('address')}
          iconLeft={<MapPin className='h-4 w-4 text-muted-foreground' />}
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
          label={t('dropdowns.orientation')}
          selected={!!filters.direction}
          onClick={() => onNavigate('orientation')}
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
          label={`${t('amenities.title')} ${filters.amenityIds && filters.amenityIds.length > 0 ? `(${filters.amenityIds.length})` : ''}`}
          selected={!!(filters.amenityIds && filters.amenityIds.length > 0)}
          onClick={() => onNavigate('amenities')}
          iconLeft={<Camera className='h-4 w-4 text-muted-foreground' />}
        />
      </div>

      <div className='p-4 space-y-6'>
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

        <ToggleSection
          icon={<MapPin className='h-4 w-4 text-muted-foreground' />}
          title={t('toggles.location')}
        >
          <LocationToggleChip />
        </ToggleSection>

        <ToggleSection
          icon={<Video className='h-4 w-4 text-muted-foreground' />}
          title={t('dropdowns.media')}
        >
          <div className='flex gap-2 flex-wrap'>
            <ToggleChip
              label={t('media.video')}
              active={!!filters.hasMedia}
              onClick={() => onUpdate({ hasMedia: !filters.hasMedia })}
            />
          </div>
        </ToggleSection>
      </div>
    </div>
  )
}

export default MobileFilterMainView
