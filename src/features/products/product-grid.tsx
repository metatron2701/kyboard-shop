'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/common/product-card'
import { getPaginatedProducts } from '@/features/products/api'
import type { StoreProduct } from '@/lib/store-shared'

interface ProductGridProps {
  initialProducts?: StoreProduct[]
}

export function ProductGrid({ initialProducts = [] }: ProductGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || 'all'
  const currentSubcategory = searchParams.get('subcategory') || ''
  const pageParam = parseInt(searchParams.get('page') || '0', 10)
  const currentPage = isNaN(pageParam) ? 0 : pageParam

  const [products, setProducts] = useState<StoreProduct[]>(initialProducts)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(initialProducts.length)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  // URL 파라미터가 바뀔 때마다 데이터 로드
  useEffect(() => {
    let ignore = false
    setLoading(true)

    getPaginatedProducts({
      categoryId: currentCategory === 'all' ? undefined : currentCategory,
      subcategoryId: currentSubcategory || undefined,
      page: currentPage,
      size: 16,
    })
      .then((res) => {
        if (!ignore) {
          setProducts(res.content)
          setTotalPages(res.totalPages)
          setTotalElements(res.totalElements)
        }
      })
      .catch((err) => {
        console.error('Failed to load products:', err)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [currentCategory, currentSubcategory, currentPage])

  // 서브카테고리 제거
  const handleClearSubcategory = () => {
    const params = new URLSearchParams()
    if (currentCategory !== 'all') {
      params.set('category', currentCategory)
    }
    startTransition(() => {
      router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
    })
  }

  // 페이지 이동
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* 상단 메타 정보 바 (카테고리 선택 탭 버튼 제거됨) */}
      <div className="mb-6 flex items-center justify-between text-xs text-zinc-500">
        <div>
          {currentSubcategory && (
            <span className="inline-flex items-center gap-1.5 rounded bg-zinc-100 px-2.5 py-1 text-zinc-800">
              <span>서브: {currentSubcategory}</span>
              <button
                aria-label="서브카테고리 필터 제거"
                className="font-bold hover:text-black"
                onClick={handleClearSubcategory}
                type="button"
              >
                ×
              </button>
            </span>
          )}
        </div>
        <span>총 {totalElements}개 상품</span>
      </div>

      {/* 상품 그리드 목록 */}
      {loading ? (
        <div className="py-24 text-center text-sm text-zinc-400">
          상품 목록을 불러오는 중입니다...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-24 text-center text-zinc-500">
          해당 조건에 등록된 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 페이지네이션 (1페이지 이상일 때 표시) */}
      {totalPages > 1 && (
        <div className="mt-14 flex items-center justify-center gap-2">
          <button
            className="rounded border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === 0 || loading || isPending}
            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
            type="button"
          >
            이전
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                className={`h-8 w-8 rounded text-xs font-medium transition ${currentPage === idx
                    ? 'bg-zinc-950 text-white'
                    : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                disabled={loading || isPending}
                key={idx}
                onClick={() => handlePageChange(idx)}
                type="button"
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <button
            className="rounded border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage >= totalPages - 1 || loading || isPending}
            onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
            type="button"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}