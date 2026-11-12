import type { StoreProduct } from '@/lib/store-shared'

// TODO(담당 5): 관리자 상품 조회/등록/수정/삭제 API를 구현하고 admin-dashboard.tsx에 연결합니다.
export type AdminProductInput = Omit<StoreProduct, 'id'>

export async function getAdminProducts(): Promise<StoreProduct[]> {
  throw new Error('TODO: 관리자 상품 목록 API를 연결하세요.')
}

export async function createAdminProduct(_input: AdminProductInput): Promise<StoreProduct> {
  throw new Error('TODO: 관리자 상품 등록 API를 연결하세요.')
}

export async function updateAdminProduct(
  _productId: string,
  _input: Partial<AdminProductInput>,
): Promise<StoreProduct> {
  throw new Error('TODO: 관리자 상품 수정 API를 연결하세요.')
}

export async function deleteAdminProduct(_productId: string): Promise<void> {
  throw new Error('TODO: 관리자 상품 삭제 API를 연결하세요.')
}
