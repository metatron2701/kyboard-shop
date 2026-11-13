'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useCart } from '@/features/cart/cart-provider'
import { getCurrentUser } from '@/features/auth/api'
import { formatPrice } from '@/lib/store-shared'
import { OrderResponseData, submitOrderApi } from './api'

export function CheckoutForm() {
  const { selectedItems, clearSelectedItems } = useCart()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<OrderResponseData | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    getCurrentUser().then(({ user }) => {
      if (user?.email) setUserEmail(user.email)
    })
  }, [])

  const subtotal = selectedItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0)
  const shipping = selectedItems.reduce((total, item) => total + item.shippingFee, 0)

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedItems.length || isSubmitting) return

    setIsSubmitting(true)
    setMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)

    const recipientName = String(formData.get('recipientName') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const email = String(formData.get('email') || userEmail || '').trim()

    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      setMessage('올바른 전화번호를 입력해 주세요. (10~11자리 숫자)')
      setIsSubmitting(false)
      return
    }

    if (!email) {
      setMessage('주문자 이메일을 입력해 주세요.')
      setIsSubmitting(false)
      return
    }

    try {
      const items = selectedItems.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      }))

      const result = await submitOrderApi({
        ordererEmail: email,
        ordererName: recipientName,
        ordererPhone: cleanPhone,
        items,
      })

      clearSelectedItems()
      setCompletedOrder(result)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-zinc-500">ORDER CONFIRMATION</p>
        <h1 className="mb-4 text-4xl font-medium tracking-[-0.04em]">Thank you for your order!</h1>
        <p className="mb-8 text-sm text-zinc-600">
          주문이 정상적으로 접수되었습니다. (주문번호: <strong>{completedOrder.orderNumber}</strong>)
        </p>

        <div className="mb-8 divide-y divide-zinc-200 rounded-xl bg-zinc-50 p-6 text-left text-sm">
          <div className="flex justify-between py-2">
            <span className="text-zinc-500">주문 상태</span>
            <span className="font-semibold text-emerald-600">{completedOrder.orderStatus}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-500">주문자 이메일</span>
            <span className="font-medium">{completedOrder.ordererEmail}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-500">최종 결제 금액</span>
            <strong className="text-base text-zinc-950">{formatPrice(completedOrder.finalPayAmount)}</strong>
          </div>
        </div>

        <a
          href="/products"
          className="inline-flex h-14 w-full items-center justify-center rounded-md bg-black text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          CONTINUE SHOPPING
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submitOrder} className="grid grid-cols-[1fr_.75fr] gap-16 max-lg:grid-cols-1">
      <div>
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-zinc-500">CHECKOUT</p>
        <h1 className="mb-12 text-5xl font-medium tracking-[-0.06em]">Where should we send it?</h1>
        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Orderer Email</span>
            <input
              className="h-14 w-full rounded-md border border-zinc-300 px-4 outline-none transition focus:border-black"
              defaultValue={userEmail}
              key={userEmail}
              name="email"
              placeholder="user@example.com"
              required
              type="email"
            />
          </label>
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
              placeholder="010-0000-0000"
              value={[phone.slice(0, 3), phone.slice(3, 7), phone.slice(7)].filter(Boolean).join('-')}
              onChange={(event) => setPhone(event.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
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
          <p className="mt-5 text-sm text-red-600" role="alert">
            {message}
          </p>
        )}
        <button
          className="mt-7 h-14 w-full rounded-md bg-black text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
          disabled={!selectedItems.length || isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'PROCESSING...' : 'PLACE ORDER'}
        </button>
      </aside>
    </form>
  )
}
