import { Suspense } from 'react'
import { ProductGrid } from '@/features/products/product-grid'
import { getPreviewProducts } from '@/features/products/preview-data'

export default function ProductsPage() {
  const initialProducts = getPreviewProducts()

  return (
    <section className="mx-auto w-[min(80%,1440px)] py-20 max-lg:w-[92%]">
      <div className="mb-16 max-w-3xl">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-zinc-500">
          THE FULL COLLECTION
        </p>
        <h1 className="text-6xl font-medium tracking-[-0.065em] max-md:text-4xl">
          Everything for a more considered desk.
        </h1>
      </div>
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-zinc-400">Loading collection...</div>
        }
      >
        <ProductGrid initialProducts={initialProducts} />
      </Suspense>
    </section>
  )
}
