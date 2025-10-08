// Vietnamese districts data (sample structure)
// This would typically come from a comprehensive database

import { findProvinceByCode } from './provinces'
import { District, normalizeVietnameseText } from './shared'

export type { District }

// Alias for backward compatibility
const stripDiacritics = normalizeVietnameseText

// Sample districts for major provinces
export const VIETNAM_DISTRICTS: District[] = [
  // Hanoi districts (code: '01')
  {
    code: '001',
    name: 'Quận Ba Đình',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Ba Đình'),
  },
  {
    code: '002',
    name: 'Quận Hoàn Kiếm',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Hoàn Kiếm'),
  },
  {
    code: '003',
    name: 'Quận Tây Hồ',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Tây Hồ'),
  },
  {
    code: '004',
    name: 'Quận Long Biên',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Long Biên'),
  },
  {
    code: '005',
    name: 'Quận Cầu Giấy',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Cầu Giấy'),
  },
  {
    code: '006',
    name: 'Quận Đống Đa',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Đống Đa'),
  },
  {
    code: '007',
    name: 'Quận Hai Bà Trưng',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Hai Bà Trưng'),
  },
  {
    code: '008',
    name: 'Quận Hoàng Mai',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Hoàng Mai'),
  },
  {
    code: '009',
    name: 'Quận Thanh Xuân',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Thanh Xuân'),
  },
  {
    code: '010',
    name: 'Huyện Sóc Sơn',
    provinceCode: '01',
    normalized: stripDiacritics('Huyện Sóc Sơn'),
  },
  {
    code: '011',
    name: 'Huyện Đông Anh',
    provinceCode: '01',
    normalized: stripDiacritics('Huyện Đông Anh'),
  },
  {
    code: '012',
    name: 'Huyện Gia Lâm',
    provinceCode: '01',
    normalized: stripDiacritics('Huyện Gia Lâm'),
  },
  {
    code: '013',
    name: 'Quận Nam Từ Liêm',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Nam Từ Liêm'),
  },
  {
    code: '014',
    name: 'Quận Bắc Từ Liêm',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Bắc Từ Liêm'),
  },
  {
    code: '015',
    name: 'Huyện Mê Linh',
    provinceCode: '01',
    normalized: stripDiacritics('Huyện Mê Linh'),
  },
  {
    code: '016',
    name: 'Quận Hà Đông',
    provinceCode: '01',
    normalized: stripDiacritics('Quận Hà Đông'),
  },

  // Ho Chi Minh City districts (code: '79')
  {
    code: '101',
    name: 'Quận 1',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 1'),
  },
  {
    code: '102',
    name: 'Quận 2',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 2'),
  },
  {
    code: '103',
    name: 'Quận 3',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 3'),
  },
  {
    code: '104',
    name: 'Quận 4',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 4'),
  },
  {
    code: '105',
    name: 'Quận 5',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 5'),
  },
  {
    code: '106',
    name: 'Quận 6',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 6'),
  },
  {
    code: '107',
    name: 'Quận 7',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 7'),
  },
  {
    code: '108',
    name: 'Quận 8',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 8'),
  },
  {
    code: '109',
    name: 'Quận 9',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 9'),
  },
  {
    code: '110',
    name: 'Quận 10',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 10'),
  },
  {
    code: '111',
    name: 'Quận 11',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 11'),
  },
  {
    code: '112',
    name: 'Quận 12',
    provinceCode: '79',
    normalized: stripDiacritics('Quận 12'),
  },
  {
    code: '113',
    name: 'Quận Bình Thạnh',
    provinceCode: '79',
    normalized: stripDiacritics('Quận Bình Thạnh'),
  },
  {
    code: '114',
    name: 'Quận Gò Vấp',
    provinceCode: '79',
    normalized: stripDiacritics('Quận Gò Vấp'),
  },
  {
    code: '115',
    name: 'Quận Phú Nhuận',
    provinceCode: '79',
    normalized: stripDiacritics('Quận Phú Nhuận'),
  },
  {
    code: '116',
    name: 'Quận Tân Bình',
    provinceCode: '79',
    normalized: stripDiacritics('Quận Tân Bình'),
  },
  {
    code: '117',
    name: 'Quận Tân Phú',
    provinceCode: '79',
    normalized: stripDiacritics('Quận Tân Phú'),
  },
  {
    code: '118',
    name: 'Quận Thủ Đức',
    provinceCode: '79',
    normalized: stripDiacritics('Quận Thủ Đức'),
  },
  {
    code: '119',
    name: 'Huyện Bình Chánh',
    provinceCode: '79',
    normalized: stripDiacritics('Huyện Bình Chánh'),
  },
  {
    code: '120',
    name: 'Huyện Cần Giờ',
    provinceCode: '79',
    normalized: stripDiacritics('Huyện Cần Giờ'),
  },
  {
    code: '121',
    name: 'Huyện Củ Chi',
    provinceCode: '79',
    normalized: stripDiacritics('Huyện Củ Chi'),
  },
  {
    code: '122',
    name: 'Huyện Hóc Môn',
    provinceCode: '79',
    normalized: stripDiacritics('Huyện Hóc Môn'),
  },
  {
    code: '123',
    name: 'Huyện Nhà Bè',
    provinceCode: '79',
    normalized: stripDiacritics('Huyện Nhà Bè'),
  },

  // Da Nang districts (code: '48')
  {
    code: '201',
    name: 'Quận Hải Châu',
    provinceCode: '48',
    normalized: stripDiacritics('Quận Hải Châu'),
  },
  {
    code: '202',
    name: 'Quận Thanh Khê',
    provinceCode: '48',
    normalized: stripDiacritics('Quận Thanh Khê'),
  },
  {
    code: '203',
    name: 'Quận Sơn Trà',
    provinceCode: '48',
    normalized: stripDiacritics('Quận Sơn Trà'),
  },
  {
    code: '204',
    name: 'Quận Ngũ Hành Sơn',
    provinceCode: '48',
    normalized: stripDiacritics('Quận Ngũ Hành Sơn'),
  },
  {
    code: '205',
    name: 'Quận Liên Chiểu',
    provinceCode: '48',
    normalized: stripDiacritics('Quận Liên Chiểu'),
  },
  {
    code: '206',
    name: 'Quận Cẩm Lệ',
    provinceCode: '48',
    normalized: stripDiacritics('Quận Cẩm Lệ'),
  },
  {
    code: '207',
    name: 'Huyện Hòa Vang',
    provinceCode: '48',
    normalized: stripDiacritics('Huyện Hòa Vang'),
  },
  {
    code: '208',
    name: 'Huyện Hoàng Sa',
    provinceCode: '48',
    normalized: stripDiacritics('Huyện Hoàng Sa'),
  },

  // Can Tho districts (code: '92')
  {
    code: '301',
    name: 'Quận Ninh Kiều',
    provinceCode: '92',
    normalized: stripDiacritics('Quận Ninh Kiều'),
  },
  {
    code: '302',
    name: 'Quận Ô Môn',
    provinceCode: '92',
    normalized: stripDiacritics('Quận Ô Môn'),
  },
  {
    code: '303',
    name: 'Quận Bình Thuỷ',
    provinceCode: '92',
    normalized: stripDiacritics('Quận Bình Thuỷ'),
  },
  {
    code: '304',
    name: 'Quận Cái Răng',
    provinceCode: '92',
    normalized: stripDiacritics('Quận Cái Răng'),
  },
  {
    code: '305',
    name: 'Quận Thốt Nốt',
    provinceCode: '92',
    normalized: stripDiacritics('Quận Thốt Nốt'),
  },
  {
    code: '306',
    name: 'Huyện Vĩnh Thạnh',
    provinceCode: '92',
    normalized: stripDiacritics('Huyện Vĩnh Thạnh'),
  },
  {
    code: '307',
    name: 'Huyện Cờ Đỏ',
    provinceCode: '92',
    normalized: stripDiacritics('Huyện Cờ Đỏ'),
  },
  {
    code: '308',
    name: 'Huyện Phong Điền',
    provinceCode: '92',
    normalized: stripDiacritics('Huyện Phong Điền'),
  },
  {
    code: '309',
    name: 'Huyện Thới Lai',
    provinceCode: '92',
    normalized: stripDiacritics('Huyện Thới Lai'),
  },

  // Hai Phong districts (code: '31')
  {
    code: '401',
    name: 'Quận Hồng Bàng',
    provinceCode: '31',
    normalized: stripDiacritics('Quận Hồng Bàng'),
  },
  {
    code: '402',
    name: 'Quận Ngô Quyền',
    provinceCode: '31',
    normalized: stripDiacritics('Quận Ngô Quyền'),
  },
  {
    code: '403',
    name: 'Quận Lê Chân',
    provinceCode: '31',
    normalized: stripDiacritics('Quận Lê Chân'),
  },
  {
    code: '404',
    name: 'Quận Hải An',
    provinceCode: '31',
    normalized: stripDiacritics('Quận Hải An'),
  },
  {
    code: '405',
    name: 'Quận Kiến An',
    provinceCode: '31',
    normalized: stripDiacritics('Quận Kiến An'),
  },
  {
    code: '406',
    name: 'Quận Đồ Sơn',
    provinceCode: '31',
    normalized: stripDiacritics('Quận Đồ Sơn'),
  },
  {
    code: '407',
    name: 'Quận Dương Kinh',
    provinceCode: '31',
    normalized: stripDiacritics('Quận Dương Kinh'),
  },
  {
    code: '408',
    name: 'Huyện Thuỷ Nguyên',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện Thuỷ Nguyên'),
  },
  {
    code: '409',
    name: 'Huyện An Dương',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện An Dương'),
  },
  {
    code: '410',
    name: 'Huyện An Lão',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện An Lão'),
  },
  {
    code: '411',
    name: 'Huyện Kiến Thuỵ',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện Kiến Thuỵ'),
  },
  {
    code: '412',
    name: 'Huyện Tiên Lãng',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện Tiên Lãng'),
  },
  {
    code: '413',
    name: 'Huyện Vĩnh Bảo',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện Vĩnh Bảo'),
  },
  {
    code: '414',
    name: 'Huyện Cát Hải',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện Cát Hải'),
  },
  {
    code: '415',
    name: 'Huyện Bạch Long Vĩ',
    provinceCode: '31',
    normalized: stripDiacritics('Huyện Bạch Long Vĩ'),
  },
]

// Create a mapping object for quick province-to-districts lookup
export const PROVINCE_DISTRICT_MAP: Record<string, District[]> =
  VIETNAM_DISTRICTS.reduce(
    (acc, district) => {
      if (!acc[district.provinceCode]) {
        acc[district.provinceCode] = []
      }
      acc[district.provinceCode].push(district)
      return acc
    },
    {} as Record<string, District[]>,
  )

// Enhanced mapping function that includes province info
export const getProvinceDistrictMap = () => {
  return Object.entries(PROVINCE_DISTRICT_MAP).map(
    ([provinceCode, districts]) => ({
      provinceCode,
      provinceName:
        findProvinceByCode(provinceCode)?.name || `Province ${provinceCode}`,
      districtCount: districts.length,
      districts: districts.sort((a, b) => a.name.localeCompare(b.name)),
    }),
  )
}

// Get districts count by province
export const getDistrictsCountByProvince = (provinceCode: string): number => {
  return PROVINCE_DISTRICT_MAP[provinceCode]?.length || 0
}

export const findDistrictByCode = (code?: string) =>
  VIETNAM_DISTRICTS.find((d) => d.code === code)

export const getDistrictsByProvinceCode = (provinceCode: string) =>
  VIETNAM_DISTRICTS.filter((d) => d.provinceCode === provinceCode)

export const searchDistricts = (keyword: string, provinceCode?: string) => {
  const k = stripDiacritics(keyword.trim())
  const districts = provinceCode
    ? getDistrictsByProvinceCode(provinceCode)
    : VIETNAM_DISTRICTS

  if (!k) return districts
  return districts.filter((d) => d.normalized.includes(k) || d.code === keyword)
}

export type DistrictCode = (typeof VIETNAM_DISTRICTS)[number]['code']
