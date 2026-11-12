// TODO(담당 3): 주문 생성 API를 구현하고 checkout-form.tsx에 연결합니다.

export type CreateOrderRequest = {
  recipientName: string
  phone: string
  shippingAddress: string
  items: Array<{
    productId: string
    quantity: number
    optionValue: string | null
  }>
}

export async function createOrder(_input: CreateOrderRequest): Promise<{ orderNumber: string }> {
  throw new Error('TODO: 주문 생성 API를 연결하세요.')
}
