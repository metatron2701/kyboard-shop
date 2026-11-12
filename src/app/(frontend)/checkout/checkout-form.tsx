'use client'

import { useState, type FormEvent } from 'react'
import { useCart } from '@/features/cart/cart-provider'
import { formatPrice } from '@/lib/store-shared'

export function CheckoutForm() {
  const { selectedItems } = useCart()
  const [message, setMessage] = useState('')
  const subtotal = selectedItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  const shipping = selectedItems.reduce((total, item) => total + item.shippingFee, 0)

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO(담당 3): 선택 상품과 배송 정보를 주문 API로 제출하고 성공 화면을 표시합니다.
    setMessage('주문 기능은 아직 연결되지 않았습니다.')
  }

  return (
    <form onSubmit={submitOrder} className="grid grid-cols-[1fr_.75fr] gap-16 max-lg:grid-cols-1">
      <div>
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-zinc-500">CHECKOUT</p>
        <h1 className="mb-12 text-5xl font-medium tracking-[-0.06em]">Where should we send it?</h1>
        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Recipient name</span>
            <input
              className="h-14 w-full rounded-md border border-zinc-300 px-4 outline-none transition focus:border-black"
              name="recipientName"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Phone number</span>
            <input
              className="h-14 w-full rounded-md border border-zinc-300 px-4 outline-none transition focus:border-black"
              inputMode="tel"
              name="phone"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Shipping address</span>
            <textarea
              className="min-h-32 w-full resize-none rounded-md border border-zinc-300 p-4 outline-none transition focus:border-black"
              name="shippingAddress"
              required
            />
          </label>
        </div>
      </div>
      <aside className="h-fit rounded-xl bg-zinc-100 p-7 lg:sticky lg:top-28">
        <h2 className="text-xl font-medium tracking-[-0.03em]">Order summary</h2>
        <div className="my-6 divide-y divide-zinc-200 border-y border-zinc-200">
          {selectedItems.map((item, index) => (
            <div
              className="flex justify-between gap-5 py-4 text-sm"
              key={`${item.productId}-${index}`}
            >
              <div>
                <p className="font-medium">
                  {item.name} × {item.quantity}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{item.optionLabel}</p>
              </div>
              <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
            </div>
          ))}
          {!selectedItems.length && (
            <p className="py-8 text-center text-sm text-zinc-500">
              선택된 상품이 없습니다. 장바구니에서 주문할 상품을 선택해 주세요.
            </p>
          )}
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Shipping</dt>
            <dd>{formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-zinc-300 pt-4 text-lg">
            <dt>Total</dt>
            <dd className="font-semibold">{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>
        {message && (
          <p className="mt-5 text-sm text-zinc-700" role="alert">
            {message}
          </p>
        )}
        <button
          className="mt-7 h-14 w-full rounded-md bg-black text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
          disabled={!selectedItems.length}
          type="submit"
        >
          PLACE ORDER
        </button>
      </aside>
    </form>
  )
}
