import Image from 'next/image'
import Link from 'next/link'
import { ArrowIcon } from '@/components/icons'
import { ProductCard } from '@/components/common/product-card'
import { mediaFrom } from '@/lib/store-shared'
import { getPreviewProducts } from '@/features/products/preview-data'

const categoryCards = [
  {
    label: 'KEYBOARDS',
    detail: 'Built for the daily ritual',
    href: '/products?category=keyboards',
  },
  { label: 'SWITCHES', detail: 'Find your perfect feel', href: '/products?category=switches' },
  { label: 'KEYCAPS', detail: 'A new texture for every key', href: '/products?category=keycaps' },
]

export default function HomePage() {
  const products = getPreviewProducts()
  const hero = products[0]
  const heroImage = hero ? mediaFrom(hero.images[0]) : null

  return (
    <>
      <section className="mx-auto w-[min(80%,1440px)] py-8 max-lg:w-[92%]">
        <div className="relative min-h-[620px] overflow-hidden rounded-xl bg-zinc-100 max-md:min-h-[520px]">
          {heroImage?.url && (
            <Image
              alt={heroImage.alt || hero.name}
              className="object-cover grayscale"
              fill
              priority
              sizes="90vw"
              src={heroImage.url}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white max-md:p-7">
            <p className="mb-5 text-xs font-semibold tracking-[0.2em]">DESIGNED FOR THE DESK</p>
            <h1 className="max-w-3xl text-6xl font-medium leading-[0.95] tracking-[-0.065em] max-md:text-4xl">
              Tools for better thinking.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
              Considered keyboards, switches, and keycaps made to turn everyday work into a tactile
              ritual.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-4 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:gap-6"
              href="/products"
            >
              전체 상품 보러가기 <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(80%,1440px)] py-24 max-lg:w-[92%]">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-zinc-500">
              CURATED ESSENTIALS
            </p>
            <h2 className="text-4xl font-medium tracking-[-0.055em]">Best sellers</h2>
          </div>
          <Link className="flex items-center gap-3 text-sm font-medium" href="/products">
            VIEW ALL <ArrowIcon />
          </Link>
        </div>
        {products.length ? (
          <div className="grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 py-24 text-center text-sm text-zinc-500">
            Products are being prepared in the studio.
          </div>
        )}
      </section>

      <section className="bg-zinc-100 py-24">
        <div className="mx-auto w-[min(80%,1440px)] max-lg:w-[92%]">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-zinc-500">
            START WITH A FEELING
          </p>
          <h2 className="mb-12 text-4xl font-medium tracking-[-0.055em]">Shop by category</h2>
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
            {categoryCards.map((category, index) => (
              <Link
                className="group flex aspect-[4/5] flex-col justify-between rounded-xl bg-white p-7 shadow-[0_16px_40px_rgba(0,0,0,0.035)] transition hover:-translate-y-1"
                href={category.href}
                key={category.label}
              >
                <span className="text-[10px] font-semibold tracking-[0.18em]">0{index + 1}</span>
                <div>
                  <h3 className="text-2xl font-medium tracking-[-0.04em]">{category.label}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
                    <span>{category.detail}</span>
                    <ArrowIcon className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-zinc-950 py-16 text-white">
        <div className="mx-auto flex w-[min(80%,1440px)] items-end justify-between max-lg:w-[92%] max-sm:block">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em]">MONO / KEYS</p>
            <p className="mt-3 text-sm text-zinc-500">Objects for focused work.</p>
          </div>
          <p className="text-xs tracking-[0.1em] text-zinc-500 max-sm:mt-10">© 2025 MONO KEYS</p>
        </div>
      </footer>
    </>
  )
}
