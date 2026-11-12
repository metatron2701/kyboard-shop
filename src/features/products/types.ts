import type { StoreProduct } from '@/lib/store-shared'

export interface SubCategory {
  id: string
  name: string
}

export interface Category {
  id: string
  label: string
  code?: string
  subcategories?: SubCategory[]
}

export interface ProductOption {
  optionId: number
  optionName: string
  additionalPrice: number
}

// nextcode 원본 Product 인터페이스
export interface Product {
  productId: number
  categoryId: string
  parentCategoryId: string
  name: string
  basePrice: number
  stockQuantity: number
  thumbnailUrl: string
  description: string
  options: ProductOption[]
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
  selectedOption?: ProductOption | null
  galleryImages?: string[]
  subCategoryName?: string
}

export interface ProductListResponse {
  content: StoreProduct[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface GetProductsParams {
  categoryId?: string | null
  subcategoryId?: string | null
  page?: number
  size?: number
}

export interface CustomBuildSelection {
  housing: Product | null
  pcb: Product | null
  switchPart: Product | null
  keycap: Product | null
}

export interface RecommendedBuild {
  housing: Product
  pcb: Product
  switchPart: Product
  keycap: Product
  assemblyFee: number
  totalPrice: number
}