'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CloseIcon } from '@/components/icons'
import { SiteHeader } from '@/components/common/site-header'
import { getCurrentUser, logIn, logOut, type ApiUser } from '@/features/auth/api'
import { signUpCustomer } from '@/features/user/api'
import { useCart } from '@/features/cart/cart-provider'
import { ProductCartContext } from '@/features/cart/components/CartContext'
import { ProductType } from '@/features/cart/interface/Product'

type AppUser = ApiUser

export function StoreShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { products } = useContext(ProductCartContext);
  const { openCart, closeCart } = useCart()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authUser, setAuthUser] = useState<AppUser | null>(null)
  const [authPending, setAuthPending] = useState(false)
  const [authError, setAuthError] = useState('')
  const [agreements, setAgreements] = useState({
    marketing: false,
    privacy: false,
    service: false,
  })
  const [navVisible, setNavVisible] = useState(true)

  useEffect(() => {
    getCurrentUser().then(({ user }) => {
      if (user) setAuthUser(user)
    })
  }, [])

  useEffect(() => {
    if (!pathname.startsWith('/products/')) return
    let previous = window.scrollY
    const onScroll = () => {
      const current = window.scrollY
      setNavVisible(current < 80 || current < previous)
      previous = current
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const openAccount = () => {
    closeCart()
    setAuthError('')
    setAuthOpen(true)
  }

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError('')
    setAuthPending(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')

    try {
      if (authMode === 'login') {
        const { user } = await logIn(email, password)
        setAuthUser(user)
        setAuthOpen(false)
      } else {
        const passwordConfirm = String(form.get('passwordConfirm') || '')
        const name = String(form.get('name') || '').trim()
        const phone = String(form.get('phone') || '').trim()

        if (password !== passwordConfirm) {
          setAuthError('비밀번호가 일치하지 않습니다.')
          setAuthPending(false)
          return
        }

        await signUpCustomer({ email, password, name, phone })
        // 가입 성공 시 자동 로그인
        const { user } = await logIn(email, password)
        setAuthUser(user)
        setAuthOpen(false)
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : '요청 처리에 실패했습니다.')
    } finally {
      setAuthPending(false)
    }
  }

  const logout = async () => {
    setAuthPending(true)
    try {
      await logOut()
      setAuthUser(null)
      setAuthOpen(false)
    } finally {
      setAuthPending(false)
    }
  }

  const cartCount = products.reduce(
    (total : any, product : ProductType) => total + product.quantity,
    0
  );

  return (
    <>
      <SiteHeader
        cartCount={cartCount}
        onOpenAccount={openAccount}
        onOpenCart={() => {
          setAuthOpen(false)
          openCart()
        }}
        user={authUser}
        visible={navVisible}
      />
      <main className="min-h-screen pt-[123px] md:pt-[150px]">{children}</main>
      <div
        className={`fixed inset-0 z-[60] transition ${authOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!authOpen}
      >
        <button
          aria-label="Close account panel"
          className={`absolute inset-0 bg-black/50 transition-opacity ${authOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setAuthOpen(false)}
          type="button"
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white p-7 shadow-2xl transition-transform duration-500 ${authOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
            <h2 className="text-2xl font-medium tracking-[-0.04em]">
              {authUser
                ? authUser.role === 'admin'
                  ? 'Admin account'
                  : 'My page'
                : authMode === 'register'
                  ? '회원가입'
                  : 'Login'}
            </h2>
            <button
              aria-label="Close account panel"
              className="rounded-full border border-zinc-200 p-2 transition hover:bg-zinc-100"
              onClick={() => setAuthOpen(false)}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>

          {authUser ? (
            <>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-xs font-semibold tracking-[0.16em] text-zinc-400">
                  SIGNED IN AS
                </p>
                <p className="mt-4 break-all text-2xl font-medium tracking-[-0.04em]">
                  {authUser.email}
                </p>
                <div className="mt-8 flex items-center justify-between border-y border-zinc-200 py-4 text-sm">
                  <span className="text-zinc-500">Role</span>
                  <strong className="uppercase tracking-[0.1em]">{authUser.role}</strong>
                </div>
                {authUser.role === 'admin' && (
                  <Link
                    className="mt-5 inline-flex h-12 items-center justify-center rounded-md bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    href="/admin/products"
                    onClick={() => setAuthOpen(false)}
                  >
                    PRODUCT MANAGEMENT
                  </Link>
                )}
                {authError && (
                  <p className="mt-5 text-sm leading-6 text-red-700" role="alert">
                    {authError}
                  </p>
                )}
              </div>
              <button
                className="flex h-14 items-center justify-center rounded-md border border-zinc-950 text-sm font-semibold transition hover:bg-zinc-100 disabled:opacity-40"
                disabled={authPending}
                onClick={logout}
                type="button"
              >
                {authPending ? 'SIGNING OUT…' : 'LOGOUT'}
              </button>
            </>
          ) : (
            <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitAuth}>
              <div className="flex-1 overflow-y-auto py-7 pr-1">
                {authMode === 'login' ? (
                  <>
                    <p className="mb-7 text-sm leading-6 text-zinc-500">
                      이메일과 비밀번호를 입력해 로그인해 주세요.
                    </p>
                    <label
                      className="block text-xs font-semibold tracking-[0.12em]"
                      htmlFor="email"
                    >
                      이메일
                    </label>
                    <input
                      autoComplete="email"
                      className="mt-3 h-13 w-full rounded-full border border-zinc-300 px-5 text-sm outline-none transition focus:border-zinc-950"
                      disabled={authPending}
                      id="email"
                      name="email"
                      placeholder="example@email.com"
                      required
                      type="email"
                    />
                    <label
                      className="mt-6 block text-xs font-semibold tracking-[0.12em]"
                      htmlFor="password"
                    >
                      비밀번호
                    </label>
                    <input
                      autoComplete="current-password"
                      className="mt-3 h-13 w-full rounded-full border border-zinc-300 px-5 text-sm outline-none transition focus:border-zinc-950"
                      disabled={authPending}
                      id="password"
                      maxLength={128}
                      minLength={8}
                      name="password"
                      placeholder="8자 이상 입력해 주세요"
                      required
                      type="password"
                    />
                    {authError && (
                      <p className="mt-5 text-sm leading-6 text-red-700" role="alert">
                        {authError}
                      </p>
                    )}
                    <div className="my-6 flex items-center gap-4 text-[11px] text-zinc-400">
                      <span className="h-px flex-1 bg-zinc-200" />
                      소셜 로그인
                      <span className="h-px flex-1 bg-zinc-200" />
                    </div>
                    <div className="space-y-3">
                      <button
                        className="flex h-13 w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white text-sm font-medium"
                        disabled
                        title="OAuth 설정 후 이용할 수 있습니다"
                        type="button"
                      >
                        <span className="font-bold text-[#4285f4]">G</span>
                        Google로 로그인
                      </button>
                      <button
                        className="flex h-13 w-full cursor-not-allowed items-center justify-center gap-3 rounded-md bg-[#fee500] text-sm font-medium text-[#191919]"
                        disabled
                        title="OAuth 설정 후 이용할 수 있습니다"
                        type="button"
                      >
                        <span className="font-bold">K</span>
                        카카오로 로그인
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-7 text-right text-[11px] text-zinc-500">
                      <span className="text-red-600">*</span> 필수 입력
                    </p>
                    {[
                      {
                        autoComplete: 'email',
                        id: 'register-email',
                        label: '이메일',
                        name: 'email',
                        placeholder: 'example@email.com',
                        type: 'email',
                      },
                      {
                        autoComplete: 'new-password',
                        id: 'register-password',
                        label: '비밀번호',
                        name: 'password',
                        placeholder: '8자 이상 입력해 주세요',
                        type: 'password',
                      },
                      {
                        autoComplete: 'new-password',
                        id: 'password-confirm',
                        label: '비밀번호 확인',
                        name: 'passwordConfirm',
                        placeholder: '비밀번호를 다시 입력해 주세요',
                        type: 'password',
                      },
                      {
                        autoComplete: 'name',
                        id: 'register-name',
                        label: '이름',
                        name: 'name',
                        placeholder: '이름',
                        type: 'text',
                      },
                      {
                        autoComplete: 'tel',
                        id: 'register-phone',
                        label: '연락처',
                        name: 'phone',
                        placeholder: '010-0000-0000',
                        type: 'tel',
                      },
                    ].map((field) => (
                      <div className="mb-5" key={field.id}>
                        <label className="block text-xs font-medium" htmlFor={field.id}>
                          {field.label} <span className="text-red-600">*</span>
                        </label>
                        <input
                          autoComplete={field.autoComplete}
                          className="mt-2 h-11 w-full rounded-full border border-zinc-300 px-4 text-sm outline-none transition placeholder:text-zinc-300 focus:border-zinc-950"
                          disabled={authPending}
                          id={field.id}
                          maxLength={field.type === 'password' ? 128 : undefined}
                          minLength={field.type === 'password' ? 8 : undefined}
                          name={field.name}
                          placeholder={field.placeholder}
                          required
                          type={field.type}
                        />
                      </div>
                    ))}
                    <div className="mb-7">
                      <label className="block text-xs font-medium" htmlFor="shipping-address">
                        배송지 <span className="text-zinc-400">(선택)</span>
                      </label>
                      <input
                        autoComplete="street-address"
                        className="mt-2 h-11 w-full rounded-full border border-zinc-300 px-4 text-sm outline-none transition placeholder:text-zinc-300 focus:border-zinc-950"
                        disabled={authPending}
                        id="shipping-address"
                        maxLength={300}
                        name="shippingAddress"
                        placeholder="주소를 입력해 주세요"
                        type="text"
                      />
                    </div>
                    <div className="border-t border-zinc-200 pt-6">
                      <div className="mb-4 flex items-center justify-between">
                        <strong className="text-sm">약관 동의</strong>
                        <span className="text-[11px] text-zinc-500">필수 / 선택</span>
                      </div>
                      <label className="flex cursor-pointer items-center gap-3 border-b border-zinc-200 pb-4 text-sm">
                        <input
                          checked={agreements.service && agreements.privacy && agreements.marketing}
                          className="size-4 accent-zinc-950"
                          onChange={(event) =>
                            setAgreements({
                              marketing: event.target.checked,
                              privacy: event.target.checked,
                              service: event.target.checked,
                            })
                          }
                          type="checkbox"
                        />
                        전체 동의하기
                      </label>
                      <div className="space-y-4 py-5 text-sm">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            checked={agreements.service}
                            className="size-4 accent-zinc-950"
                            onChange={(event) =>
                              setAgreements((current) => ({
                                ...current,
                                service: event.target.checked,
                              }))
                            }
                            required
                            type="checkbox"
                          />
                          (필수) 서비스 이용약관 동의
                        </label>
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            checked={agreements.privacy}
                            className="size-4 accent-zinc-950"
                            onChange={(event) =>
                              setAgreements((current) => ({
                                ...current,
                                privacy: event.target.checked,
                              }))
                            }
                            required
                            type="checkbox"
                          />
                          (필수) 개인정보 수집·이용 동의
                        </label>
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            checked={agreements.marketing}
                            className="size-4 accent-zinc-950"
                            onChange={(event) =>
                              setAgreements((current) => ({
                                ...current,
                                marketing: event.target.checked,
                              }))
                            }
                            type="checkbox"
                          />
                          (선택) 이벤트 및 마케팅 정보 수신 동의
                        </label>
                      </div>
                    </div>
                    {authError && (
                      <p className="mb-5 text-sm leading-6 text-red-700" role="alert">
                        {authError}
                      </p>
                    )}
                    <button
                      className="text-xs font-semibold underline underline-offset-4"
                      onClick={() => {
                        setAuthError('')
                        setAuthMode('login')
                        setAgreements({
                          marketing: false,
                          privacy: false,
                          service: false,
                        })
                      }}
                      type="button"
                    >
                      로그인으로 돌아가기
                    </button>
                  </>
                )}
              </div>
              <div className="mt-4 grid shrink-0 grid-cols-2 gap-3">
                <button
                  className="flex h-14 items-center justify-center rounded-md bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40"
                  disabled={authPending}
                  type="submit"
                >
                  {authPending ? '처리 중…' : authMode === 'login' ? '로그인' : '회원가입'}
                </button>
                {authMode === 'login' && (
                  <Link
                    className="flex h-14 items-center justify-center rounded-md border border-zinc-300 text-sm font-semibold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-50"
                    href="/signup"
                    onClick={() => {
                      setAuthError('')
                      setAuthOpen(false)
                    }}
                  >
                    회원가입
                  </Link>
                )}
              </div>
            </form>
          )}
        </aside>
      </div>
    </>
  )
}
