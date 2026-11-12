export type StoreMedia = {
  id: string | number
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type StoreProduct = {
  id: number
  name: string
  slug: string
  basePrice: number
  category: 'keyboards' | 'switches' | 'keycaps' | 'housing'
  description: string
  stockQuantity: number
  shippingFee: number
  brand: string
  kcCertificationNumber?: string | null
  options?: Array<{
    id?: string | null
    label: string
    value: string
    priceAdjustment: number
  }> | null
  images: Array<string | number | StoreMedia>
  // 키보드 부품 상세 스펙 (nextcode 호환 속성)
  layout?: string
  supportPins?: number[]
  isWireless?: boolean
  pin?: number
  switchType?: string
  soundType?: string
  material?: string
  style?: string
  isSoldOut?: boolean
  status?: 'ACTIVE' | 'SOLD_OUT' | 'DISCONTINUED'
  subCategoryName?: string
  categoryId?: string
  parentCategoryId?: string
  galleryImages?: string[]
}

export function mediaFrom(value: StoreProduct['images'][number]): StoreMedia | null {
  return typeof value === 'object' ? value : null
}

export function formatPrice(value: number) {
  if (value >= 1000) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
