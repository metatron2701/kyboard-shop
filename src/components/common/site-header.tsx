'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CloseIcon } from '@/components/icons'
import type { ApiUser } from '@/features/auth/api'

type SubCategoryItem = {
  name: string
  href: string
}

type CategoryItem = {
  label: string
  href: string
  children: SubCategoryItem[]
}

const categories: CategoryItem[] = [
  { label: '전체상품', href: '/products', children: [] },
  {
    label: 'HOUSING',
    href: '/products?category=housing',
    children: [
      { name: '알루미늄', href: '/products?category=housing&subcategory=housing-alu' },
      { name: '폴리카보네이트', href: '/products?category=housing&subcategory=housing-pc' },
      { name: '목재', href: '/products?category=housing&subcategory=housing-wood' },
      { name: '아크릴', href: '/products?category=housing&subcategory=housing-acrylic' },
      { name: '플라스틱/ABS', href: '/products?category=housing&subcategory=housing-abs' },
    ],
  },
  {
    label: 'KEYBOARDS',
    href: '/products?category=keyboards',
    children: [
      { name: '65%', href: '/products?category=keyboards&subcategory=kb-65' },
      { name: '75%', href: '/products?category=keyboards&subcategory=kb-75' },
      { name: '텐키리스', href: '/products?category=keyboards&subcategory=kb-tkl' },
      { name: '핫스왑', href: '/products?category=keyboards&subcategory=pcb-hotswap' },
      { name: '유무선/블루투스', href: '/products?category=keyboards&subcategory=pcb-wireless' },
    ],
  },
  {
    label: 'SWITCHES',
    href: '/products?category=switches',
    children: [
      { name: '리니어', href: '/products?category=switches&subcategory=switch-linear' },
      { name: '택타일', href: '/products?category=switches&subcategory=switch-tactile' },
      { name: '저소음', href: '/products?category=switches&subcategory=switch-silent' },
      { name: '클릭', href: '/products?category=switches&subcategory=switch-click' },
    ],
  },
  {
    label: 'KEYCAPS',
    href: '/products?category=keycaps',
    children: [
      { name: 'PBT', href: '/products?category=keycaps&subcategory=keycap-pbt' },
      { name: 'ABS', href: '/products?category=keycaps&subcategory=keycap-abs' },
      { name: 'POM', href: '/products?category=keycaps&subcategory=keycap-pom' },
    ],
  },
  { label: 'CUSTOM', href: '/custom', children: [] },
]

type SiteHeaderProps = {
  cartCount: number
  user: ApiUser | null
  visible: boolean
  onOpenCart: () => void
  onOpenAccount: () => void
}

export function SiteHeader({
  cartCount,
  user,
  visible,
  onOpenCart,
  onOpenAccount,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-zinc-300 bg-white/95 backdrop-blur transition-transform duration-500 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className="relative mx-auto h-[123px] w-[min(80%,1184px)] max-lg:w-[92%] md:h-[150px]">
          <Link
            className="absolute left-0 top-4 text-sm font-semibold tracking-[-0.04em] sm:text-base"
            href="/"
          >
            <span className="sm:hidden">M/K</span>
            <span className="hidden sm:inline">MONO / KEYS</span>
          </Link>

          <nav
            aria-label="Utility navigation"
            className="absolute right-0 top-[18px] flex items-center gap-3 text-[10px] font-medium tracking-[-0.01em] text-[#34264b] sm:gap-5 sm:text-[12px] lg:gap-7 lg:text-[15px]"
          >
            <button className="whitespace-nowrap" onClick={() => setSearchOpen(true)} type="button">
              SEARCH
            </button>
            <button className="whitespace-nowrap" onClick={onOpenCart} type="button">
              CART <span aria-label={`${cartCount} items`}>({cartCount})</span>
            </button>
            <button className="whitespace-nowrap" onClick={onOpenAccount} type="button">
              {user ? (user.role === 'admin' ? 'ADMIN' : 'MYPAGE') : 'LOGIN'}
            </button>
          </nav>

          <nav
            aria-label="Main navigation"
            className="absolute inset-x-0 bottom-[18px] flex items-end justify-between gap-7 overflow-x-auto pb-1 md:bottom-[20px] md:grid md:grid-cols-6 md:gap-5 md:overflow-visible md:pb-0"
          >
            {categories.map((category) => (
              <Link
                className="shrink-0 origin-bottom text-[15px] font-bold leading-none tracking-[-0.055em] transition-transform duration-300 hover:scale-[1.08] md:justify-self-center md:text-[25px]"
                href={category.href}
                key={category.label}
                onMouseEnter={() => setMenuOpen(true)}
              >
                {category.label}
              </Link>
            ))}
          </nav>
        </div>
        <div
          className={`absolute inset-x-0 top-full overflow-hidden bg-zinc-200 transition-all duration-300 ${menuOpen ? 'max-h-80 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}
        >
          <div className="mx-auto grid w-[min(80%,1184px)] grid-cols-6 gap-5 py-9 max-lg:w-[92%] max-md:grid-cols-2">
            {categories.map((category) => (
              <div className="text-center" key={category.label}>
                {category.children.length > 0 && (
                  <ul className="space-y-2.5 text-sm text-zinc-600">
                    {category.children.map((child) => (
                      <li key={child.name}>
                        <Link
                          className="transition-colors hover:text-black"
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {menuOpen && (
        <button
          aria-label="Close category menu"
          className="fixed inset-0 z-40 bg-black/50"
          onMouseEnter={() => setMenuOpen(false)}
          type="button"
        />
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[70] bg-white/95 px-6 pt-[min(22vh,180px)] backdrop-blur">
          <button
            aria-label="검색 닫기"
            className="absolute right-8 top-8 rounded-full border border-zinc-200 p-2"
            onClick={() => setSearchOpen(false)}
            type="button"
          >
            <CloseIcon />
          </button>
          <form
            className="mx-auto flex max-w-3xl items-center gap-4 border-b-2 border-zinc-950 pb-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="sr-only" htmlFor="store-search">
              상품 검색
            </label>
            <input
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-3xl outline-none placeholder:text-zinc-300 sm:text-5xl"
              id="store-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="찾으시는 상품을 검색하세요"
              type="search"
              value={query}
            />
            {query && (
              <button className="text-sm text-zinc-500" onClick={() => setQuery('')} type="button">
                지우기
              </button>
            )}
          </form>
          <p className="mx-auto mt-5 max-w-3xl text-sm text-zinc-500">
            검색 결과 연결은 추후 적용 예정입니다.
          </p>
        </div>
      )}
    </>
  )
}
