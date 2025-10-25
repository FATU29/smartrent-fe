import { Property } from '@/api/types/property.type'

export interface PriceHistoryPoint {
  date: string
  price: number
  pricePerSqm?: number
  highest?: number
  lowest?: number
}

export interface PriceHistoryData {
  current: number
  pricePerSqm: number
  changePercentage: number
  changeAmount: number
  period: '1year' | '2years' | '5years'
  chartData: PriceHistoryPoint[]
  averagePrice: {
    label: string
    value: number
  }
  highestPrice: {
    label: string
    value: number
  }
  // Statistics
  minPrice: number
  maxPrice: number
  avgPrice: number
  totalChanges: number
  priceIncreases: number
  priceDecreases: number
}

export interface HostInfo {
  id: string
  name: string
  avatar?: string
  phone: string
  maskedPhone: string
  role: string
  isOnline?: boolean
  totalListings?: number
  zaloLink?: string
  isProfessional?: boolean
  professionalInfo?: string
}

export interface LocationData {
  coordinates: {
    latitude: number
    longitude: number
  }
  nearbyPlaces?: {
    type: 'transport' | 'shopping' | 'education' | 'healthcare'
    name: string
    distance: string
    walkTime: string
  }[]
}

export interface PropertyFeature {
  icon: string
  label: string
  value: string | number
}

export interface PropertyMetadata {
  postDate: string
  expiryDate: string
  listingType: string
  listingId: string
}

export interface ApartmentDetail extends Property {
  // Additional fields for apartment detail page
  direction?: string
  postDate?: string
  location?: LocationData
  pricePerSqm?: number
  priceIncrease?: {
    amount: number
    percentage: number
  }
  smartPriceScore?: number
  availability?: {
    status: 'available' | 'unavailable' | 'pending'
    message: string
  }
  host: HostInfo
  priceHistoryData?: PriceHistoryData
  videoTour?: string
  fullDescription?: string
  features?: PropertyFeature[]
  metadata?: PropertyMetadata
  legalDocuments?: string
  floors?: number
  frontWidth?: number
  roadWidth?: number
  breadcrumb?: {
    category: string
    city: string
    district: string
  }
}

export interface SimilarProperty {
  id: string
  title: string
  address: string
  city: string
  district: string
  price: number
  currency: string
  bedrooms?: number
  bathrooms?: number
  area: number
  images: string[]
  imageCount: number
  postDate?: string
  isVip?: boolean
  verified?: boolean
}

// Mock data for the apartment detail page
export const mockApartmentDetail: ApartmentDetail = {
  id: '44338997',
  title: 'Nhà 4 tầng 5,52x25m sát mặt tiền Thống Nhất Gò Vấp chỉ 11 tỷ',
  description:
    'Nhà 4 tầng BTCT, 4 phòng ngủ khép kín, 5 WC, phòng thờ, sân đậu xe oto.',
  fullDescription:
    '- Dt: 5.52m x 25m nở hậu 6,25m.\n- Kết cấu 4 tầng BTCT, 4 phòng ngủ khép kín, 5 WC, phòng thờ, sân đậu xe oto.\n- Sổ nở hậu nhe, sổ hoàn công đủ, có sân bên hông thoáng mát, ban công mỗi tầng chữ L bao quanh phòng cực mát.',
  address: 'Đường Thống Nhất, Phường 16, Gò Vấp, Hồ Chí Minh',
  city: 'Hồ Chí Minh',
  property_type: 'Nhà riêng',
  bedrooms: 4,
  bathrooms: 5,
  price: 11000000000,
  currency: 'VND',
  area: 139,
  pricePerSqm: 79140000,
  direction: 'East',
  furnishing: 'Nội thất cơ bản',
  verified: false,
  featured: false,
  views: 127,
  postDate: '22/10/2025',
  floors: 4,
  frontWidth: 5.52,
  roadWidth: 4,
  legalDocuments: 'Sổ đỏ/Sổ hồng',
  breadcrumb: {
    category: 'Nhà riêng tại đường Thống Nhất',
    city: 'Hồ Chí Minh',
    district: 'Gò Vấp',
  },
  location: {
    coordinates: {
      latitude: 10.846194,
      longitude: 106.662431,
    },
  },
  images: ['/images/example.png', '/images/example.png', '/images/example.png'],
  amenities: [],
  priceIncrease: {
    amount: 640000000,
    percentage: 6.1,
  },
  features: [
    { icon: 'money', label: 'Khoảng giá', value: '11 tỷ' },
    { icon: 'building', label: 'Số tầng', value: '4 tầng' },
    { icon: 'area', label: 'Diện tích', value: '139 m²' },
    { icon: 'width', label: 'Mặt tiền', value: '5,5 m' },
    { icon: 'bed', label: 'Số phòng ngủ', value: '4 phòng' },
    { icon: 'road', label: 'Đường vào', value: '4 m' },
    { icon: 'bath', label: 'Số phòng tắm, vệ sinh', value: '5 phòng' },
    { icon: 'document', label: 'Pháp lý', value: 'Sổ đỏ/ Sổ hồng' },
  ],
  metadata: {
    postDate: '22/10/2025',
    expiryDate: '06/11/2025',
    listingType: 'Tin thường',
    listingId: '44338997',
  },
  host: {
    id: 'host1',
    name: 'Phạm Mỹ Tường Vy',
    phone: '+84969355000',
    maskedPhone: '0969 355 ***',
    role: 'Môi giới',
    isOnline: true,
    totalListings: 48,
    zaloLink: 'https://zalo.me/0969355000',
    isProfessional: true,
    professionalInfo:
      'X2 hiệu quả hiển thị cùng tài khoản Môi giới chuyên nghiệp.',
  },
  priceHistoryData: {
    current: 121,
    pricePerSqm: 79.14,
    changePercentage: 6.1,
    changeAmount: 640000000,
    period: '1year',
    chartData: [
      { date: 'T10/24', price: 115, pricePerSqm: 72, highest: 180, lowest: 70 },
      { date: 'T11/24', price: 110, pricePerSqm: 68, highest: 165, lowest: 75 },
      { date: 'T12/24', price: 108, pricePerSqm: 66, highest: 160, lowest: 75 },
      { date: 'T1/25', price: 105, pricePerSqm: 64, highest: 155, lowest: 78 },
      { date: 'T2/25', price: 108, pricePerSqm: 66, highest: 165, lowest: 80 },
      { date: 'T3/25', price: 112, pricePerSqm: 68, highest: 170, lowest: 78 },
      { date: 'T4/25', price: 115, pricePerSqm: 70, highest: 172, lowest: 76 },
      { date: 'T5/25', price: 118, pricePerSqm: 72, highest: 175, lowest: 75 },
      { date: 'T6/25', price: 119, pricePerSqm: 73, highest: 178, lowest: 74 },
      { date: 'T7/25', price: 120, pricePerSqm: 74, highest: 180, lowest: 73 },
      { date: 'T8/25', price: 121, pricePerSqm: 75, highest: 180, lowest: 72 },
      {
        date: 'T9/25',
        price: 121,
        pricePerSqm: 79.14,
        highest: 180,
        lowest: 72,
      },
    ],
    averagePrice: {
      label: 'Giá phổ biến nhất',
      value: 121,
    },
    highestPrice: {
      label: 'Giá phổ biến T9/25 là cao nhất trong 7 năm qua',
      value: 180,
    },
    // Statistics calculated from chartData
    minPrice: 105, // Lowest average price in the period (T1/25)
    maxPrice: 121, // Highest average price in the period (T9/25)
    avgPrice: 114.25, // Average of all prices: (115+110+108+105+108+112+115+118+119+120+121+121)/12
    totalChanges: 11, // Number of month-to-month changes (12 data points = 11 changes)
    priceIncreases: 8, // Number of times price increased from previous month
    priceDecreases: 3, // Number of times price decreased from previous month
  },
}

export const mockSimilarProperties: SimilarProperty[] = [
  {
    id: '2',
    title: 'Hiếm, Thống Nhất 2 tầng 3 phòng ngủ,...',
    address: 'Gò Vấp',
    city: 'Hồ Chí Minh',
    district: 'Gò Vấp',
    price: 4600000000,
    currency: 'VND',
    bedrooms: 3,
    area: 42,
    images: ['/images/example.png'],
    imageCount: 6,
    postDate: 'Đăng hôm nay',
  },
  {
    id: '3',
    title: '2 MẶT TIỀN SẮT CITY LAND HXT OTO NẰM...',
    address: 'Gò Vấp',
    city: 'Hồ Chí Minh',
    district: 'Gò Vấp',
    price: 7000000000,
    currency: 'VND',
    area: 60,
    images: ['/images/example.png'],
    imageCount: 15,
    postDate: 'Đăng hôm nay',
  },
  {
    id: '4',
    title: 'GO VẤP . LÊN SÓNG SIÊU PHẨM 3.5M x10M...',
    address: 'Gò Vấp',
    city: 'Hồ Chí Minh',
    district: 'Gò Vấp',
    price: 4260000000,
    currency: 'VND',
    area: 32,
    images: ['/images/example.png'],
    imageCount: 12,
    postDate: 'Đăng hôm nay',
  },
  {
    id: '5',
    title: 'NHÀ 3 TẦNG MỚI KENG HẺM XE HƠI...',
    address: 'Gò Vấp',
    city: 'Hồ Chí Minh',
    district: 'Gò Vấp',
    price: 5800000000,
    currency: 'VND',
    area: 45,
    images: ['/images/example.png'],
    imageCount: 5,
    postDate: 'Đăng hôm nay',
  },
  {
    id: '6',
    title: 'Nhà ngay Thống Nhất Phường 16 Gò Vấp',
    address: 'Gò Vấp',
    city: 'Hồ Chí Minh',
    district: 'Gò Vấp',
    price: 6500000000,
    currency: 'VND',
    area: 55,
    images: ['/images/example.png'],
    imageCount: 6,
    postDate: 'Đăng hôm nay',
  },
  {
    id: '7',
    title: 'Bán biệt thự 3 tầng rẻ nhất Gò Vấp, nở hậu...',
    address: 'Gò Vấp',
    city: 'Hồ Chí Minh',
    district: 'Gò Vấp',
    price: 8900000000,
    currency: 'VND',
    area: 75,
    images: ['/images/example.png'],
    imageCount: 5,
    postDate: 'Đăng hôm nay',
  },
]

export const mockRecentlyViewed: SimilarProperty[] = [
  {
    id: '101',
    title: 'Quận lý và cho thuê Grand Marin...',
    address: 'Quận 1',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    price: 40000000,
    currency: 'VND',
    area: 69,
    images: ['/images/example.png'],
    imageCount: 12,
    postDate: 'Đăng 20/09/2025',
    verified: true,
  },
  {
    id: '102',
    title: 'Nhà KDC Phú Hồng Thịnh 10. Chỉ 6.2 tỉ rẻ...',
    address: 'Dĩ An, Bình Dương',
    city: 'Bình Dương',
    district: 'Dĩ An',
    price: 6200000000,
    currency: 'VND',
    area: 60,
    images: ['/images/example.png'],
    imageCount: 22,
    postDate: 'Đăng 2 tuần trước',
  },
  {
    id: '103',
    title: 'Cho thuê nhà nguyên căn 100m2 trung tâm...',
    address: 'Hải Châu, Đà Nẵng',
    city: 'Đà Nẵng',
    district: 'Hải Châu',
    price: 20000000,
    currency: 'VND',
    area: 100,
    images: ['/images/example.png'],
    imageCount: 10,
    postDate: 'Đăng 23/07/2025',
  },
  {
    id: '104',
    title: 'Căn hộ 1PN 2PN 3PN giá rẻ nhất TP HCM chi...',
    address: 'Quận 9',
    city: 'Hồ Chí Minh',
    district: 'Quận 9',
    price: 6000000,
    currency: 'VND',
    area: 69,
    images: ['/images/example.png'],
    imageCount: 13,
    postDate: 'Đăng 22/08/2025',
  },
  {
    id: '105',
    title: 'Full giỏ hàng căn hộ Masteri 1PN, 2PN -...',
    address: 'Quận 2',
    city: 'Hồ Chí Minh',
    district: 'Quận 2',
    price: 16500000,
    currency: 'VND',
    area: 65,
    images: ['/images/example.png'],
    imageCount: 23,
    postDate: 'Đăng 2 tuần trước',
  },
  {
    id: '106',
    title: 'Nằm full giỏ hàng cho thuê Empire City...',
    address: 'Quận 2',
    city: 'Hồ Chí Minh',
    district: 'Quận 2',
    price: 26000000,
    currency: 'VND',
    area: 85,
    images: ['/images/example.png'],
    imageCount: 17,
    postDate: 'Đăng 6 ngày trước',
    isVip: true,
  },
]
