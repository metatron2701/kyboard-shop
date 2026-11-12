import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, mediaFrom, type StoreProduct } from '@/lib/store-shared'

export function ProductCard({ product }: { product: StoreProduct }) {
  const image = mediaFrom(product.images[0])
  const isDiscontinued = product.status === 'DISCONTINUED'
  const isSoldOut =
    Boolean(product.isSoldOut) || product.stockQuantity <= 0 || product.status === 'SOLD_OUT'
  const isUnavailable = isDiscontinued || isSoldOut

  return (
    <Link
      className={`group flex aspect-[4/5] flex-col overflow-hidden bg-zinc-100 transition ${isUnavailable ? 'opacity-80' : ''}`}
      href={`/products/${product.id}`}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {image?.url ? (
          <Image
            alt={image.alt || product.name}
            className="object-cover transition duration-700 group-hover:scale-[1.035]"
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 20vw"
            src={image.url}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs tracking-[0.16em] text-zinc-400">
            IMAGE PENDING
          </div>
        )}
        {isDiscontinued ? (
          <span className="absolute right-3 top-3 rounded bg-zinc-700 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white">
            DISCONTINUED
          </span>
        ) : isSoldOut ? (
          <span className="absolute right-3 top-3 rounded bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white">
            SOLD OUT
          </span>
        ) : null}
      </div>
      <div className="flex min-h-24 items-end justify-between gap-4 px-5 py-5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium tracking-[-0.025em]">{product.name}</h3>
          <p className="mt-1 text-[11px] text-zinc-400">{product.brand}</p>
        </div>
        <span className="shrink-0 text-sm font-medium">{formatPrice(product.basePrice)}</span>
      </div>
    </Link>
  )
}