'use client'

import { useContext, useState } from 'react'
import Image from 'next/image'
import { MinusIcon, PlusIcon } from '@/components/icons'
import { useCart } from '@/features/cart/cart-provider'
import { formatPrice, mediaFrom, type StoreProduct } from '@/lib/store-shared'
import { ProductType } from '../cart/interface/Product'
import { ProductCartContext } from '../cart/components/CartContext'

interface ProductDetailViewProps {
  product: StoreProduct
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { openCart } = useCart()
  const { handleAddProduct } = useContext(ProductCartContext)

  // 갤러리 이미지 세트
  const images = product.images.map(mediaFrom).filter((image) => image?.url)
  const option = product.options?.[0]
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const currentImage = images[selectedImageIndex] || images[0]

  // 옵션 선택 (키캡 배열 등)
  const options = product.options && product.options.length > 0 ? product.options : null
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    options ? String(options[0].id || options[0].value) : '',
  )

  const activeOption =
    options?.find((opt) => String(opt.id || opt.value) === selectedOptionId) || options?.[0]
  const additionalPrice = activeOption?.priceAdjustment ?? 0
  const unitPrice = product.basePrice + additionalPrice

  // 수량
  const [quantity, setQuantity] = useState(1)

  // 품절 및 판매중지 상태
  const isDiscontinued = product.status === 'DISCONTINUED'
  const isSoldOut =
    Boolean(product.isSoldOut) || product.stockQuantity <= 0 || product.status === 'SOLD_OUT'
  const isUnavailable = isDiscontinued || isSoldOut

  // 수량 조절
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncreaseQuantity = () => {
    if (quantity >= product.stockQuantity) {
      alert(`최대 주문 가능 수량은 ${product.stockQuantity}개입니다.`)
      return
    }
    setQuantity((prev) => prev + 1)
  }

  // 장바구니 담기
  const handleAddToCart = () => {
    if (isUnavailable) {
      alert(
        isDiscontinued ? '판매가 중단된 상품입니다.' : '현재 품절되어 장바구니에 담을 수 없습니다.',
      )
      return
    }

    const newProduct: ProductType = {
      productId: product.id,
      name: product.name,
      price: unitPrice,
      stockQuantity: product.stockQuantity,
      quantity,
      thumbnailUrl: currentImage?.url ?? undefined,
      partType: '',
      additionalPrice: option?.priceAdjustment ?? 0,
      customBuildId: 0,
      buildName: '',
      includeAssembly: false,
    }

    handleAddProduct(newProduct)
    openCart()
  }

  return (
    <div className="grid grid-cols-[1.25fr_.75fr] gap-16 max-lg:grid-cols-1">
      {/* 좌측: 메인 이미지 & 갤러리 썸네일 */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
          {currentImage?.url ? (
            <Image
              alt={currentImage.alt || product.name}
              className={`object-cover transition-opacity duration-300 ${
                isUnavailable ? 'opacity-60' : ''
              }`}
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 50vw"
              src={currentImage.url}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs tracking-[0.16em] text-zinc-400">
              IMAGE PENDING
            </div>
          )}

          {/* 품절/단종 뱃지 */}
          {isDiscontinued ? (
            <span className="absolute right-4 top-4 rounded bg-zinc-800 px-3 py-1 text-xs font-semibold tracking-wider text-white">
              DISCONTINUED
            </span>
          ) : isSoldOut ? (
            <span className="absolute right-4 top-4 rounded bg-zinc-950 px-3 py-1 text-xs font-semibold tracking-wider text-white">
              SOLD OUT
            </span>
          ) : null}
        </div>

        {/* 썸네일 리스트 */}
        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((image, index) => {
              const isSelected = selectedImageIndex === index
              return (
                <button
                  className={`relative aspect-square overflow-hidden rounded-md bg-zinc-100 transition ${
                    isSelected
                      ? 'ring-2 ring-zinc-950 ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  key={image!.id || index}
                  onClick={() => setSelectedImageIndex(index)}
                  type="button"
                >
                  <Image
                    alt={image!.alt || product.name}
                    className="object-cover"
                    fill
                    sizes="15vw"
                    src={image!.url!}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 우측: 상품 정보 및 주문 컨트롤 */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {product.brand} / {product.category.replace('-', ' ')}
          {product.subCategoryName ? ` · ${product.subCategoryName}` : ''}
        </p>
        <h1 className="mt-5 text-5xl font-medium leading-none tracking-[-0.06em]">
          {product.name}
        </h1>

        <div className="mt-6 flex items-baseline gap-3">
          <p className="text-2xl font-medium">{formatPrice(unitPrice)}</p>
          {additionalPrice !== 0 && (
            <span className="text-xs text-zinc-500">
              (기본가 {formatPrice(product.basePrice)}{' '}
              {additionalPrice > 0
                ? `+${formatPrice(additionalPrice)}`
                : formatPrice(additionalPrice)}
              )
            </span>
          )}
        </div>

        <p className="my-8 border-y border-zinc-200 py-6 text-base leading-7 text-zinc-600">
          {product.description}
        </p>

        {/* 옵션 선택 영역 (옵션이 있을 경우) */}
        {options && options.length > 0 && (
          <div className="mb-6">
            <label
              className="mb-2 block text-xs font-semibold tracking-wider text-zinc-600"
              htmlFor="product-option-select"
            >
              OPTION (배열 / 규격)
            </label>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const optKey = String(opt.id || opt.value)
                const isSelected = selectedOptionId === optKey
                return (
                  <button
                    className={`rounded-md border px-3.5 py-2 text-xs font-medium transition ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                    }`}
                    key={optKey}
                    onClick={() => setSelectedOptionId(optKey)}
                    type="button"
                  >
                    {opt.label}
                    {opt.priceAdjustment > 0 && ` (+${formatPrice(opt.priceAdjustment)})`}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 수량 및 장바구니 담기 */}
        <div className="flex gap-3">
          <div className="flex h-14 items-center rounded-md border border-zinc-200">
            <button
              aria-label="Decrease quantity"
              className="h-full px-3 text-zinc-600 hover:text-black disabled:opacity-40"
              disabled={isUnavailable}
              onClick={handleDecreaseQuantity}
              type="button"
            >
              <MinusIcon />
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              aria-label="Increase quantity"
              className="h-full px-3 text-zinc-600 hover:text-black disabled:opacity-40"
              disabled={isUnavailable}
              onClick={handleIncreaseQuantity}
              type="button"
            >
              <PlusIcon />
            </button>
          </div>

          <button
            className={`h-14 flex-1 rounded-md px-6 text-sm font-semibold tracking-wide transition ${
              isUnavailable
                ? 'cursor-not-allowed bg-zinc-200 text-zinc-400'
                : 'bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.99]'
            }`}
            disabled={isUnavailable}
            onClick={handleAddToCart}
            type="button"
          >
            {isDiscontinued
              ? 'DISCONTINUED'
              : isSoldOut
                ? 'SOLD OUT'
                : `ADD TO CART — ${formatPrice(unitPrice * quantity)}`}
          </button>
        </div>

        {/* 제품 사양 및 상세 정보 */}
        <dl className="mt-10 grid grid-cols-2 gap-y-4 border-t border-zinc-200 pt-7 text-sm">
          <dt className="text-zinc-500">Stock</dt>
          <dd className="text-right font-medium">
            {isUnavailable ? 'Out of stock' : `${product.stockQuantity} available`}
          </dd>

          <dt className="text-zinc-500">Shipping</dt>
          <dd className="text-right">
            {product.shippingFee ? formatPrice(product.shippingFee) : 'Complimentary'}
          </dd>

          {product.layout && (
            <>
              <dt className="text-zinc-500">Layout</dt>
              <dd className="text-right font-medium">{product.layout}%</dd>
            </>
          )}

          {product.pin && (
            <>
              <dt className="text-zinc-500">Pin spec</dt>
              <dd className="text-right font-medium">{product.pin} Pin</dd>
            </>
          )}

          {product.supportPins && product.supportPins.length > 0 && (
            <>
              <dt className="text-zinc-500">Supported Pins</dt>
              <dd className="text-right font-medium">{product.supportPins.join(', ')} Pin</dd>
            </>
          )}

          {product.switchType && (
            <>
              <dt className="text-zinc-500">Switch Type</dt>
              <dd className="text-right font-medium uppercase">{product.switchType}</dd>
            </>
          )}

          {product.material && (
            <>
              <dt className="text-zinc-500">Material</dt>
              <dd className="text-right font-medium">{product.material}</dd>
            </>
          )}

          <dt className="text-zinc-500">KC certification</dt>
          <dd className="text-right">{product.kcCertificationNumber || 'Not applicable'}</dd>
        </dl>
      </div>
    </div>
  )
}
