import { apiRequest } from '@/lib/api-client'

export type AddCartItemRequest = {
  productId: string
  quantity: number
}

// 백엔드가 내려주는 장바구니 아이템 응답 타입
export type CartItemResponse = {
  cartItemId: number
  productId: number
  name: string
  price: number
  quantity: number
  thumbnailUrl?: string
}
// 1. 내 장바구니 목록 조회 (GET /api/cart)
export async function getCartApi(): Promise<CartItemResponse[]> {
  try {
    // credentials: 'include'가 기본 적용되어 있어 쿠키(access_token)가 자동 전송됩니다.
    const res = await apiRequest<any>('/api/cart')
    return res.data || res || []
  } catch (error) {
    console.error('장바구니 조회 실패:', error)
    return []
  }
}

// 2. 장바구니에 상품 담기 (POST /api/cart)
export async function addCartItemApi(productId: number, quantity: number): Promise<boolean> {
  try {
    await apiRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    })
    return true
  } catch (error) {
    console.error('장바구니 담기 실패:', error)
    return false
  }
}