import { apiRequest } from '@/lib/api-client'
import type { StoreProduct } from '@/lib/store-shared'
import { MOCK_CATEGORIES, MOCK_PRODUCTS, STORE_MOCK_PRODUCTS } from './mock-data'
import type { Category, GetProductsParams, ProductListResponse } from './types'

/**
 * 카테고리 목록 조회
 * Spring Boot REST API (/api/categories) 호출을 시도하고,
 * 오프라인/개발 환경일 때는 MOCK_CATEGORIES로 대체(Fallback)합니다.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    return await apiRequest<Category[]>('/api/categories')
  } catch {
    return MOCK_CATEGORIES
  }
}

/**
 * 상품 목록 필터링 및 페이징 도우미 (오프라인/Fallback 로직)
 */
function filterMockProducts(params: GetProductsParams = {}): ProductListResponse {
  const { categoryId = null, subcategoryId = null, page = 0, size = 16 } = params
  let filtered = [...STORE_MOCK_PRODUCTS]

  // 대분류 카테고리 필터
  if (categoryId && categoryId !== 'all') {
    const catNorm = categoryId.toLowerCase()
    filtered = filtered.filter((p) => {
      const pParent = (p.parentCategoryId || p.category || '').toLowerCase()
      const pCat = (p.categoryId || '').toLowerCase()
      if (pCat === catNorm || pParent === catNorm) return true
      if (
        (catNorm === 'keyboards' || catNorm === 'pcb') &&
        (pParent === 'keyboards' || pParent === 'pcb')
      )
        return true
      if (
        (catNorm === 'switches' || catNorm === 'switch') &&
        (pParent === 'switches' || pParent === 'switch')
      )
        return true
      if (
        (catNorm === 'keycaps' || catNorm === 'keycap') &&
        (pParent === 'keycaps' || pParent === 'keycap')
      )
        return true
      return false
    })
  }

  // 소분류 서브카테고리 필터
  if (subcategoryId) {
    filtered = filtered.filter((p) => {
      if (p.categoryId === subcategoryId) return true
      if (subcategoryId === 'kb-65' && p.layout === '65') return true
      if (subcategoryId === 'kb-75' && p.layout === '75') return true
      if (subcategoryId === 'kb-tkl' && (p.layout === '87' || p.layout === 'TKL')) return true
      if (subcategoryId === 'switch-linear' && p.switchType === 'linear') return true
      if (subcategoryId === 'switch-tactile' && p.switchType === 'tactile') return true
      if (subcategoryId === 'switch-silent' && p.switchType === 'silent') return true
      if (subcategoryId === 'switch-click' && p.switchType === 'click') return true
      if (subcategoryId === 'housing-wood' && p.name.includes('목재')) return true
      return false
    })
  }

  const totalElements = filtered.length
  const totalPages = Math.ceil(totalElements / size) || 1
  const start = page * size
  const content = filtered.slice(start, start + size)

  return {
    content,
    pageNumber: page,
    pageSize: size,
    totalElements,
    totalPages,
  }
}

/**
 * 페이징 및 소분류 필터링을 지원하는 상품 목록 조회
 */
export async function getPaginatedProducts(
  params: GetProductsParams = {},
): Promise<ProductListResponse> {
  const search = new URLSearchParams()
  if (params.categoryId && params.categoryId !== 'all') search.set('category', params.categoryId)
  if (params.subcategoryId) search.set('subcategory', params.subcategoryId)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.size !== undefined) search.set('size', String(params.size))

  const queryString = search.toString() ? `?${search.toString()}` : ''

  try {
    return await apiRequest<ProductListResponse>(`/api/products${queryString}`)
  } catch {
    return filterMockProducts(params)
  }
}

/**
 * 상품 목록 조회 (기존 팀 프로젝트 시그니처 및 nextcode 파라미터 시그니처 동시 지원)
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
    const query = category ? `?category=${category}` : ''
    const result = await apiRequest<StoreProduct[] | ProductListResponse>(`/api/products${query}`)
    if (Array.isArray(result)) return result
    if (result && Array.isArray(result.content)) return result.content
    return filterMockProducts({ categoryId: category, size: 100 }).content
  } catch {
    return filterMockProducts({ categoryId: category, size: 100 }).content
  }
}

/**
 * 상품 단건 상세 조회 (productId 또는 slug 기준)
 */
export async function getProductById(productId: string | number): Promise<StoreProduct> {
  const idStr = String(productId)
  try {
    return await apiRequest<StoreProduct>(`/api/products/${encodeURIComponent(idStr)}`)
  } catch {
    const found = STORE_MOCK_PRODUCTS.find((p) => String(p.id) === idStr || p.slug === idStr)
    if (!found) {
      throw new Error(`상품을 찾을 수 없습니다. (ID: ${idStr})`)
    }
    return found
  }
}

/**
 * nextcode 호환용 별칭
 */
export const getProductDetail = getProductById
