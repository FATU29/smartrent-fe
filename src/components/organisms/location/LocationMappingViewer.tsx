import React, { useState } from 'react'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import {
  VIETNAM_PROVINCES,
  getProvinceDistrictMap,
  getWardsByDistrictCode,
  getWardsCountByDistrict,
  findProvinceByCode,
  findDistrictByCode,
  findWardByCode,
  Ward,
  District,
} from '@/constants'
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Building2,
  Home,
} from 'lucide-react'

interface LocationMappingViewerProps {
  onSelect?: (location: {
    province?: string
    district?: string
    ward?: string
  }) => void
  selectedLocation?: {
    province?: string
    district?: string
    ward?: string
  }
}

// Helper function to get ward type styling
const getWardTypeClassName = (wardType: string): string => {
  if (wardType === 'phường') {
    return 'border-green-200 text-green-700'
  }
  if (wardType === 'xã') {
    return 'border-blue-200 text-blue-700'
  }
  return 'border-orange-200 text-orange-700'
}

// Ward Item Component
const WardItem: React.FC<{
  ward: Ward
  onSelect: (code: string) => void
}> = ({ ward, onSelect }) => {
  const wardTypeClassName = getWardTypeClassName(ward.type)

  return (
    <button
      key={ward.code}
      type='button'
      className='flex items-center gap-2 p-2 hover:bg-muted/10 rounded-lg transition-colors w-full text-left'
      onClick={() => onSelect(ward.code)}
    >
      <Home className='h-3 w-3 text-green-600 ml-5' />
      <Typography variant='small' className='text-sm text-muted-foreground'>
        {ward.name}
      </Typography>
      <Badge variant='outline' className={`text-xs ${wardTypeClassName}`}>
        {ward.type}
      </Badge>
    </button>
  )
}

// District Item Component
const DistrictItem: React.FC<{
  district: District
  isExpanded: boolean
  onToggle: (code: string) => void
  onSelect: (code: string) => void
  onWardSelect: (code: string) => void
}> = ({ district, isExpanded, onToggle, onSelect, onWardSelect }) => (
  <div key={district.code} className='space-y-1'>
    <div className='flex items-center gap-2 p-2 hover:bg-muted/20 rounded-lg transition-colors'>
      <Button
        variant='ghost'
        size='icon'
        className='h-5 w-5 p-0'
        onClick={() => onToggle(district.code)}
      >
        {isExpanded ? (
          <ChevronDown className='h-3 w-3' />
        ) : (
          <ChevronRight className='h-3 w-3' />
        )}
      </Button>
      <Building2 className='h-3 w-3 text-blue-600' />
      <button
        type='button'
        className='text-sm flex-1 text-left'
        onClick={() => onSelect(district.code)}
      >
        <Typography variant='small' className='text-sm'>
          {district.name}
        </Typography>
      </button>
      <Badge variant='secondary' className='text-xs'>
        {getWardsCountByDistrict(district.code)} phường/xã
      </Badge>
    </div>

    {isExpanded && (
      <div className='ml-6 space-y-1'>
        {getWardsByDistrictCode(district.code).map((ward: Ward) => (
          <WardItem key={ward.code} ward={ward} onSelect={onWardSelect} />
        ))}
      </div>
    )}
  </div>
)

const ProvinceItem: React.FC<{
  province: {
    provinceCode: string
    provinceName: string
    districtCount: number
    districts: District[]
  }
  isExpanded: boolean
  expandedDistricts: Set<string>
  onToggleProvince: (code: string) => void
  onToggleDistrict: (code: string) => void
  onProvinceSelect: (code: string) => void
  onDistrictSelect: (code: string) => void
  onWardSelect: (code: string) => void
}> = ({
  province,
  isExpanded,
  expandedDistricts,
  onToggleProvince,
  onToggleDistrict,
  onProvinceSelect,
  onDistrictSelect,
  onWardSelect,
}) => (
  <div key={province.provinceCode} className='space-y-1'>
    <div className='flex items-center gap-2 p-2 hover:bg-muted/30 rounded-lg transition-colors'>
      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6 p-0'
        onClick={() => onToggleProvince(province.provinceCode)}
      >
        {isExpanded ? (
          <ChevronDown className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </Button>
      <MapPin className='h-4 w-4 text-primary' />
      <button
        type='button'
        className='font-medium flex-1 text-left'
        onClick={() => onProvinceSelect(province.provinceCode)}
      >
        <Typography variant='small' className='font-medium'>
          {province.provinceName}
        </Typography>
      </button>
      <Badge variant='outline' className='text-xs'>
        {province.districtCount} quận/huyện
      </Badge>
    </div>

    {isExpanded && (
      <div className='ml-8 space-y-1'>
        {province.districts.map((district: District) => (
          <DistrictItem
            key={district.code}
            district={district}
            isExpanded={expandedDistricts.has(district.code)}
            onToggle={onToggleDistrict}
            onSelect={onDistrictSelect}
            onWardSelect={onWardSelect}
          />
        ))}
      </div>
    )}
  </div>
)

const SelectedLocationDisplay: React.FC<{
  selectedLocation?: {
    province?: string
    district?: string
    ward?: string
  }
}> = ({ selectedLocation }) => {
  if (
    !selectedLocation ||
    (!selectedLocation.province &&
      !selectedLocation.district &&
      !selectedLocation.ward)
  ) {
    return null
  }

  return (
    <div className='p-4 bg-muted/30 rounded-lg border'>
      <Typography variant='small' className='text-muted-foreground mb-2'>
        Địa điểm đã chọn:
      </Typography>
      <div className='flex flex-wrap gap-2'>
        {selectedLocation.province && (
          <Badge variant='default'>
            {findProvinceByCode(selectedLocation.province)?.name}
          </Badge>
        )}
        {selectedLocation.district && (
          <Badge variant='secondary'>
            {findDistrictByCode(selectedLocation.district)?.name}
          </Badge>
        )}
        {selectedLocation.ward && (
          <Badge variant='outline'>
            {findWardByCode(selectedLocation.ward)?.name ||
              selectedLocation.ward}
          </Badge>
        )}
      </div>
    </div>
  )
}

export const LocationMappingViewer: React.FC<LocationMappingViewerProps> = ({
  onSelect,
  selectedLocation,
}) => {
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(
    new Set(),
  )
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(
    new Set(),
  )
  const [searchQuery, setSearchQuery] = useState('')

  const provinceDistrictMap = getProvinceDistrictMap()

  // Helper functions for calculations
  const getTotalDistricts = () => {
    return provinceDistrictMap.reduce((sum, p) => sum + p.districtCount, 0)
  }

  const getTotalWards = () => {
    return provinceDistrictMap.reduce(
      (sum, p) =>
        sum +
        p.districts.reduce(
          (distSum, d) => distSum + getWardsCountByDistrict(d.code),
          0,
        ),
      0,
    )
  }

  const getFilteredProvinces = () => {
    return provinceDistrictMap.filter(
      (province) =>
        !searchQuery ||
        province.provinceName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        province.districts.some((district) =>
          district.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    )
  }

  const toggleProvince = (provinceCode: string) => {
    const newExpanded = new Set(expandedProvinces)
    if (newExpanded.has(provinceCode)) {
      newExpanded.delete(provinceCode)
      // Also collapse all districts in this province
      const districtsToCollapse =
        provinceDistrictMap
          .find((p) => p.provinceCode === provinceCode)
          ?.districts.map((d) => d.code) || []

      const newExpandedDistricts = new Set(expandedDistricts)
      districtsToCollapse.forEach((code) => newExpandedDistricts.delete(code))
      setExpandedDistricts(newExpandedDistricts)
    } else {
      newExpanded.add(provinceCode)
    }
    setExpandedProvinces(newExpanded)
  }

  const toggleDistrict = (districtCode: string) => {
    const newExpanded = new Set(expandedDistricts)
    if (newExpanded.has(districtCode)) {
      newExpanded.delete(districtCode)
    } else {
      newExpanded.add(districtCode)
    }
    setExpandedDistricts(newExpanded)
  }

  const handleLocationSelect = (
    type: 'province' | 'district' | 'ward',
    code: string,
  ) => {
    if (!onSelect) return

    const district = findDistrictByCode(code)

    let districtCode: string | undefined
    if (type === 'district') {
      districtCode = code
    } else if (type === 'ward') {
      districtCode = district?.code
    } else {
      districtCode = undefined
    }

    const newLocation = {
      province: type === 'province' ? code : selectedLocation?.province,
      district: districtCode,
      ward: type === 'ward' ? code : undefined,
    }

    onSelect(newLocation)
  }

  const filteredProvinces = getFilteredProvinces()

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='space-y-2'>
        <Typography variant='h4' className='flex items-center gap-2'>
          <MapPin className='h-5 w-5' />
          Bản đồ địa danh Việt Nam
        </Typography>
        <Typography variant='muted' className='text-sm'>
          Khám phá cấu trúc hành chính: Tỉnh/Thành phố → Quận/Huyện → Phường/Xã
        </Typography>
      </div>

      {/* Search */}
      <div className='relative'>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Tìm kiếm tỉnh, thành, quận, huyện...'
          className='w-full rounded-lg border bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus-visible:outline-none'
        />
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='text-center p-3 bg-primary/5 rounded-lg border'>
          <Typography variant='large' className='text-primary font-bold'>
            {VIETNAM_PROVINCES.length}
          </Typography>
          <Typography variant='small' className='text-muted-foreground'>
            Tỉnh/Thành phố
          </Typography>
        </div>
        <div className='text-center p-3 bg-blue-50 rounded-lg border'>
          <Typography variant='large' className='text-blue-600 font-bold'>
            {getTotalDistricts()}
          </Typography>
          <Typography variant='small' className='text-muted-foreground'>
            Quận/Huyện
          </Typography>
        </div>
        <div className='text-center p-3 bg-green-50 rounded-lg border'>
          <Typography variant='large' className='text-green-600 font-bold'>
            {getTotalWards()}
          </Typography>
          <Typography variant='small' className='text-muted-foreground'>
            Phường/Xã
          </Typography>
        </div>
      </div>

      {/* Location Tree */}
      <div className='space-y-2 max-h-[60vh] overflow-y-auto border rounded-lg p-4'>
        {filteredProvinces.map((province) => (
          <ProvinceItem
            key={province.provinceCode}
            province={province}
            isExpanded={expandedProvinces.has(province.provinceCode)}
            expandedDistricts={expandedDistricts}
            onToggleProvince={toggleProvince}
            onToggleDistrict={toggleDistrict}
            onProvinceSelect={(code) => handleLocationSelect('province', code)}
            onDistrictSelect={(code) => handleLocationSelect('district', code)}
            onWardSelect={(code) => handleLocationSelect('ward', code)}
          />
        ))}

        {filteredProvinces.length === 0 && (
          <div className='text-center py-8'>
            <Typography variant='muted' className='text-sm'>
              Không tìm thấy kết quả nào
            </Typography>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      <SelectedLocationDisplay selectedLocation={selectedLocation} />
    </div>
  )
}
