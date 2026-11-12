// TODO(담당 3): 장바구니 담기/수량 변경/삭제 API를 구현하고 cart-provider.tsx에 연결합니다.

export type AddCartItemRequest = {
  productId: string
  quantity: number
  optionValue: string | null
}

export async function addCartItem(_input: AddCartItemRequest): Promise<void> {
  throw new Error('TODO: 장바구니 추가 API를 연결하세요.')
}

export async function updateCart(_input: AddCartItemRequest): Promise<void> {
  throw new Error('TODO: 장바구니 수정 API를 연결하세요.')
}

export async function deleteCart(): Promise<void> {
  throw new Error('TODO: 장바구니 삭제 API를 연결하세요.')
}
