import { apiRequest } from '@/lib/api-client'
import type { ApiResponse } from '@/features/user/api'
import { AddCartItemRequest } from '@/features/cart/api'

export type OrderItemInput = {
  productId: number
  quantity: number
}

export type OrderCreateInput = {
  ordererEmail: string
  ordererName?: string
  ordererPhone?: string
  items: OrderItemInput[]
}

export type OrderResponseData = {
  orderId: number
  orderNumber: string
  orderStatus: string
  ordererName: string
  ordererPhone: string
  ordererEmail: string
  totalProductAmount: number
  deliveryFee: number
  finalPayAmount: number
  orderedAt?: string
  createdAt?: string
  items?: Array<{
    orderItemId: number
    productId: number
    productName: string
    unitPrice: number
    quantity: number
    totalPrice: number
  }>
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

export async function submitOrderApi(input: OrderCreateInput): Promise<OrderResponseData> {
  const res = await apiRequest<ApiResponse<OrderResponseData>>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function getOrderApi(orderId: number): Promise<OrderResponseData> {
  const res = await apiRequest<ApiResponse<OrderResponseData>>(`/api/orders/${orderId}`, {
    method: 'GET',
  })
  return res.data
}