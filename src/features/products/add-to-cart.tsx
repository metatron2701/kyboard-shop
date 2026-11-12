'use client'

import { useContext, useState } from 'react'
import { MinusIcon, PlusIcon } from '@/components/icons'
import { useCart } from '@/features/cart/cart-provider'
import { formatPrice, type StoreProduct } from '@/lib/store-shared'
import { ProductCartContext } from '../cart/components/CartContext' 
import { ProductType } from '../cart/interface/Product' 

export function AddToCart({ product, image }: { product: StoreProduct; image?: string }) {
  const { openCart } = useCart()
  const { handleAddProduct } = useContext(ProductCartContext);
  const [quantity, setQuantity] = useState(1)
  const option = product.options?.[0]
  const optionValue = option?.value ?? ''
  const unitPrice = product.basePrice + (option?.priceAdjustment ?? 0)

  const handleClick = () => {
    const newProduct: ProductType = {
      productId: product.id,
      name: product.name,
      price: unitPrice,
      stockQuantity: product.stockQuantity,
      quantity,
      thumbnailUrl: image ?? '',
      partType: '',
      additionalPrice: option?.priceAdjustment ?? 0,
      customBuildId: 0,
      buildName: '',
      includeAssembly: false,
    }

    handleAddProduct(newProduct)
    openCart()
  }

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex h-14 items-center rounded-md border border-zinc-200">
          <button
            aria-label="Decrease quantity"
            className="h-full px-3"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            type="button"
          >
            <MinusIcon />
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            aria-label="Increase quantity"
            className="h-full px-3"
            onClick={() => setQuantity((value) => Math.min(product.stockQuantity, value + 1))}
            type="button"
          >
            <PlusIcon />
          </button>
        </div>
        <button
          className="h-14 flex-1 rounded-md bg-zinc-800 px-6 text-sm font-semibold text-white transition hover:bg-zinc-950 active:scale-[0.99]"
          onClick={handleClick}
          type="button"
        >
          ADD TO CART — {formatPrice(unitPrice * quantity)}
        </button>
      </div>
    </div>
  )
}