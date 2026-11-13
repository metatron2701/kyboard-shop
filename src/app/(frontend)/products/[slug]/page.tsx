import Link from 'next/link'
import { getProductById } from '@/features/products/api'
import { ProductDetailView } from '@/features/products/product-detail-view'
import type { StoreProduct } from '@/lib/store-shared'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let product: StoreProduct | null = null
  try {
    product = await getProductById(slug)
  } catch {
    product = null
  }

  if (!product) {
    return (
      <section className="mx-auto w-[min(80%,1440px)] py-20 text-center max-lg:w-[92%]">
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12">
          <p className="text-lg font-medium text-zinc-700">해당 상품을 찾을 수 없습니다.</p>
          <p className="mt-2 text-sm text-zinc-500">
            존재하지 않거나 삭제된 상품입니다. (ID: {slug})
          </p>
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
            href="/products"
          >
            전체 상품 목록으로 돌아가기
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-[min(80%,1440px)] py-10 max-lg:w-[92%]">
      <ProductDetailView product={product} />
    </section>
  )
}
