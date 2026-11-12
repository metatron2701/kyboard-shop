'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

const inputClass =
  'mt-2 h-12 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5'

export default function SignupPage() {
  const [postalCode, setPostalCode] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const searchAddress = () => {
    // TODO(담당 2): 우편번호 검색 서비스를 연결하고 주소/우편번호를 채웁니다.
    setError('주소 검색 기능은 아직 연결되지 않았습니다. 우편번호와 주소를 직접 입력해 주세요.')
  }

  const submitSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    const passwordConfirm = String(form.get('passwordConfirm') || '')

    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }
    if (!postalCode || !address) {
      setError('주소 검색으로 배송지를 선택해 주세요.')
      return
    }

    // TODO(담당 2): 회원가입 API 호출 후 성공 화면/스토어 이동을 연결합니다.
    setError('회원가입 기능은 아직 연결되지 않았습니다.')
  }

  return (
    <>
      <main className="mx-auto w-[min(92%,560px)] py-14 sm:py-20">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-zinc-500">
            MONO / KEYS · ACCOUNT
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.06em] sm:text-5xl">회원가입</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            계정을 만들고 더 편안한 쇼핑을 시작해 보세요.
          </p>
        </div>

        <form
          className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-9"
          onSubmit={submitSignup}
        >
          <label className="block text-sm font-medium text-zinc-800">
            이메일
            <input
              autoComplete="email"
              className={inputClass}
              maxLength={254}
              name="email"
              placeholder="example@email.com"
              required
              type="email"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            비밀번호
            <input
              autoComplete="new-password"
              className={inputClass}
              maxLength={128}
              minLength={8}
              name="password"
              placeholder="8자 이상 입력해 주세요"
              required
              type="password"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            비밀번호 확인
            <input
              autoComplete="new-password"
              className={inputClass}
              maxLength={128}
              minLength={8}
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력해 주세요"
              required
              type="password"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            이름
            <input
              autoComplete="name"
              className={inputClass}
              maxLength={50}
              name="name"
              placeholder="이름을 입력해 주세요"
              required
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            연락처
            <input
              autoComplete="tel"
              className={inputClass}
              inputMode="tel"
              maxLength={20}
              name="phone"
              pattern="[0-9+()\\-\\s]{8,20}"
              placeholder="010-0000-0000"
              required
              type="tel"
            />
          </label>

          <fieldset className="space-y-3 border-t border-zinc-200 pt-5">
            <legend className="text-sm font-medium text-zinc-800">배송지</legend>
            <div className="flex gap-2">
              <input
                aria-label="우편번호"
                className={`${inputClass} mt-0 max-w-36 bg-zinc-50`}
                name="postalCode"
                placeholder="우편번호"
                required
                onChange={(event) => setPostalCode(event.target.value)}
                value={postalCode}
              />
              <button
                className="h-12 shrink-0 rounded-md border border-zinc-300 px-4 text-sm font-medium transition hover:border-zinc-950 hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-60"
                onClick={searchAddress}
                type="button"
              >
                주소 검색
              </button>
            </div>
            <input
              aria-label="기본 주소"
              className={`${inputClass} mt-0 bg-zinc-50`}
              name="address"
              onChange={(event) => setAddress(event.target.value)}
              placeholder="주소를 입력해 주세요"
              required
              value={address}
            />
            <input
              autoComplete="address-line2"
              className={`${inputClass} mt-0`}
              name="detailAddress"
              placeholder="상세 주소 (동·호수 등)"
              required
            />
            <p className="text-xs leading-5 text-zinc-500">
              우편번호와 도로명 또는 지번 주소를 검색한 뒤 상세 주소를 입력해 주세요.
            </p>
          </fieldset>

          {error && (
            <p
              className="rounded-md bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="h-13 w-full rounded-md bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-50"
            type="submit"
          >
            회원가입
          </button>

          <p className="text-center text-sm text-zinc-500">
            이미 계정이 있으신가요?{' '}
            <Link className="font-semibold text-zinc-900 underline underline-offset-4" href="/">
              스토어에서 로그인
            </Link>
          </p>
        </form>

        <div className="mt-7 text-center">
          <Link
            className="text-xs font-medium tracking-[0.1em] text-zinc-500 hover:text-black"
            href="/"
          >
            ← BACK TO STORE
          </Link>
        </div>
      </main>
    </>
  )
}
