export enum PROVINCE_CODE {
  HANOI = 1,
  HO_CHI_MINH = 79,
  DA_NANG = 32,
  BINH_DUONG = 47,
  DONG_NAI = 92,
}

export const imageMap: Record<string, string> = {
  [PROVINCE_CODE.HANOI]: '/images/ha-noi.jpg',
  [PROVINCE_CODE.HO_CHI_MINH]: '/images/ho-chi-minh.jpg',
  [PROVINCE_CODE.DA_NANG]: '/images/da-nang.jpg',
  [PROVINCE_CODE.BINH_DUONG]: '/images/binh-duong.png',
  [PROVINCE_CODE.DONG_NAI]: '/images/dong-nai.jpg',
}
