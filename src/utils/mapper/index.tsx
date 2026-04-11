export enum PROVINCE_ID {
  HANOI = 1,
  HO_CHI_MINH = 49,
  DA_NANG = 32,
  BINH_DUONG = 47,
  DONG_NAI = 48,
}

export enum PROVINCE_CODE {
  HANOI = 1,
  HO_CHI_MINH = 79,
  DA_NANG = 48,
  BINH_DUONG = 74,
  DONG_NAI = 75,
}

export const imageMap: Record<string, string> = {
  [PROVINCE_CODE.HANOI]: '/images/ha-noi.jpg',
  [PROVINCE_CODE.HO_CHI_MINH]: '/images/ho-chi-minh.jpg',
  [PROVINCE_CODE.DA_NANG]: '/images/da-nang.jpg',
  [PROVINCE_CODE.BINH_DUONG]: '/images/binh-duong.png',
  [PROVINCE_CODE.DONG_NAI]: '/images/dong-nai.jpg',
}

export const imageMapByProvinceId: Record<string, string> = {
  [PROVINCE_ID.HANOI]: '/images/ha-noi.jpg',
  [PROVINCE_ID.HO_CHI_MINH]: '/images/ho-chi-minh.jpg',
  [PROVINCE_ID.DA_NANG]: '/images/da-nang.jpg',
  [PROVINCE_ID.BINH_DUONG]: '/images/binh-duong.png',
  [PROVINCE_ID.DONG_NAI]: '/images/dong-nai.jpg',
}

export enum CATEGORY_CODE {
  CHO_THUE_PHONG_TRO = 1,
  CHO_THUE_CAN_HO = 2,
  CHO_THUE_NHA_NGUYEN_CAN = 3,
  CHO_THUE_VAN_PHONG = 4,
  CHO_THUE_MAT_BANG = 5,
}

export const imageMapCategory: Record<string, string> = {
  [CATEGORY_CODE.CHO_THUE_PHONG_TRO]: '/images/cho-thue-phong-tro.jpg',
  [CATEGORY_CODE.CHO_THUE_CAN_HO]: '/images/cho-thue-can-ho.jpg',
  [CATEGORY_CODE.CHO_THUE_NHA_NGUYEN_CAN]:
    '/images/cho-thue-nha-nguyen-can.jpg',
  [CATEGORY_CODE.CHO_THUE_VAN_PHONG]: '/images/cho-thue-van-phong.jpg',
  [CATEGORY_CODE.CHO_THUE_MAT_BANG]: '/images/cho-thue-mat-bang.jpg',
}
