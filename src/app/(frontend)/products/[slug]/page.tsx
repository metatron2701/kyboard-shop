import { notFound } from 'next/navigation'
import { getProductById } from '@/features/products/api'
import { getPreviewProduct } from '@/features/products/preview-data'
import { ProductDetailView } from '@/features/products/product-detail-view'
import type { StoreProduct } from '@/lib/store-shared'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let product: StoreProduct | null = null
  try {
    product = await getProductById(slug)
  } catch {
    product = getPreviewProduct(slug)
  }

  if (!product) notFound()

  return (
    <section className="mx-auto w-[min(80%,1440px)] py-10 max-lg:w-[92%]">
      <ProductDetailView product={product} />
    </section>
  )
}
