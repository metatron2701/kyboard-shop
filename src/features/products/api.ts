import { apiRequest } from '@/lib/api-client'
import type { StoreProduct } from '@/lib/store-shared'
import type { Category, GetProductsParams, ProductListResponse } from './types'

// 기본 카테고리 정의
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', label: '전체 상품', code: 'ALL PRODUCTS', subcategories: [] },
  { id: 'housing', label: '하우징', code: 'HOUSING', subcategories: [] },
  { id: 'keyboards', label: '키보드/기판', code: 'KEYBOARDS', subcategories: [] },
  { id: 'switches', label: '스위치', code: 'SWITCHES', subcategories: [] },
  { id: 'keycaps', label: '키캡', code: 'KEYCAPS', subcategories: [] },
]

/**
 * 백엔드 상품 DTO를 프론트엔드 StoreProduct 모델로 변환
 */
function toStoreProduct(raw: any): StoreProduct {
  const categoryRaw = (raw.partType || raw.categoryId || 'keyboards').toLowerCase()
  let category: StoreProduct['category'] = 'keyboards'
  if (categoryRaw.includes('switch')) category = 'switches'
  else if (categoryRaw.includes('keycap')) category = 'keycaps'
  else if (categoryRaw.includes('housing')) category = 'housing'

  const imgUrl = raw.thumbnailURL || raw.thumbnailUrl || null

  return {
    id: raw.productId ?? raw.id,
    name: raw.name || '',
    slug: String(raw.productId ?? raw.id),
    basePrice: raw.basePrice ?? 0,
    category,
    description: raw.description || '',
    stockQuantity: raw.stockQuantity ?? 0,
    shippingFee: 0,
    brand: 'MONO / KEYS',
    images: imgUrl ? [{ id: raw.productId ?? raw.id, url: imgUrl, alt: raw.name }] : [],
    status: raw.isActive === false ? 'DISCONTINUED' : ((raw.stockQuantity ?? 0) <= 0 ? 'SOLD_OUT' : 'ACTIVE'),
    isSoldOut: (raw.stockQuantity ?? 0) <= 0,
    categoryId: raw.categoryId,
    parentCategoryId: category,
  }
}

/**
 * 카테고리 목록 조회
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await apiRequest<any>('/api/categories')
    const list = res?.data || res
    if (Array.isArray(list) && list.length > 0) return list
  } catch {}
  return DEFAULT_CATEGORIES
}

/**
 * 페이징 및 필터링 지원 상품 목록 조회 (백엔드 DB 전용)
 */
export async function getPaginatedProducts(
  params: GetProductsParams = {},
): Promise<ProductListResponse> {
  const search = new URLSearchParams()
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.size !== undefined) search.set('size', String(params.size))
  if (params.categoryId && params.categoryId !== 'all') search.set('category', params.categoryId)
  if (params.subcategoryId) search.set('subcategory', params.subcategoryId)

  const queryString = search.toString() ? `?${search.toString()}` : ''

  try {
    const rawRes = await apiRequest<any>(`/api/products${queryString}`)
    const pageData = rawRes?.data?.content ? rawRes.data : (rawRes?.content ? rawRes : null)

    if (pageData && Array.isArray(pageData.content)) {
      const content = pageData.content.map(toStoreProduct)
      return {
        content,
        pageNumber: pageData.number ?? pageData.pageNumber ?? 0,
        pageSize: pageData.size ?? pageData.pageSize ?? 16,
        totalElements: pageData.totalElements ?? content.length,
        totalPages: pageData.totalPages ?? (content.length > 0 ? 1 : 0),
      }
    }
  } catch (err) {
    console.error('Failed to fetch products from backend:', err)
  }

  return {
    content: [],
    pageNumber: params.page || 0,
    pageSize: params.size || 16,
    totalElements: 0,
    totalPages: 0,
  }
}

/**
 * 상품 전체 목록 조회 (백엔드 DB 전용)
 */
export async function getProducts(
  categoryOrParams?: StoreProduct['category'] | GetProductsParams,
): Promise<StoreProduct[]> {
  if (typeof categoryOrParams === 'object' && categoryOrParams !== null) {
    const res = await getPaginatedProducts(categoryOrParams)
    return res.content
  }

  const category = categoryOrParams as StoreProduct['category'] | undefined
  try {
    const query = category ? `?category=${category}&size=100` : '?size=100'
    const res = await apiRequest<any>(`/api/products${query}`)
    const pageData = res?.data?.content ? res.data : (res?.content ? res : null)
    if (pageData && Array.isArray(pageData.content)) {
      return pageData.content.map(toStoreProduct)
    }
  } catch (err) {
    console.error('Failed to fetch products from backend:', err)
  }

  return []
}

/**
 * 상품 단건 상세 조회 (백엔드 DB 전용)
 */
export async function getProductById(productId: number): Promise<StoreProduct | null> {
  const idStr = String(productId)
  try {
    const res = await apiRequest<any>(`/api/products/${encodeURIComponent(idStr)}`)
    const raw = res?.data || res
    if (raw && (raw.productId !== undefined || raw.id !== undefined)) {
      return toStoreProduct(raw)
    }
  } catch (err) {
    console.error(`Failed to fetch product ${idStr} from backend:`, err)
  }

  return null
}

/**
 * 호환용 별칭
 */
export const getProductDetail = getProductById
