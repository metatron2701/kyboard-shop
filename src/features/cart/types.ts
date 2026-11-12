export type CartItem = {
  productId: string
  slug: string
  name: string
  image?: string
  optionValue?: string
  optionLabel?: string
  unitPrice: number
  shippingFee: number
  quantity: number
}
