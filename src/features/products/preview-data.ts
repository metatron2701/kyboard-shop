import { demoProducts } from '@/lib/demo-products'
import type { StoreProduct } from '@/lib/store-shared'
import { STORE_MOCK_PRODUCTS } from './mock-data'

// 모든 샘플 상품 풀: nextcode의 풍부한 48종 키보드 부품 + 기존 데모 상품
const ALL_PREVIEW_PRODUCTS: StoreProduct[] = [...STORE_MOCK_PRODUCTS, ...demoProducts]

// 화면과 페이지 이동을 확인하기 위한 샘플 상품입니다. 카테고리별 필터링 지원.
export function getPreviewProducts(category?: StoreProduct['category']) {
  if (!category || category === ('all' as any)) return ALL_PREVIEW_PRODUCTS
  return ALL_PREVIEW_PRODUCTS.filter((product) => product.category === category)
}

// 상품 ID 또는 slug로 조회
export function getPreviewProduct(productId: string) {
  return (
    ALL_PREVIEW_PRODUCTS.find(
      (product) => String(product.id) === productId || product.slug === productId,
    ) ?? null
  )
}
