'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowIcon } from '@/components/icons'
import { useCart } from '@/features/cart/cart-provider'
import { MOCK_PRODUCTS } from '@/features/products/mock-data'
import type { Product, ProductOption } from '@/features/products/types'
import { formatPrice } from '@/lib/store-shared'

// 하우징 레이아웃 코드에 맞춰 키캡의 옵션을 탐색하는 헬퍼 함수
const getMatchingKeycapOption = (keycapProduct: Product, layout?: string): ProductOption | null => {
  if (!keycapProduct?.options || keycapProduct.options.length === 0) return null

  return (
    keycapProduct.options.find((opt) => {
      if (layout === '87')
        return opt.optionName.includes('87') || opt.optionName.includes('텐키리스')
      if (layout === '75') return opt.optionName.includes('75') || opt.optionName.includes('컴팩트')
      if (layout === '65') return opt.optionName.includes('65') || opt.optionName.includes('미니멀')
      return false
    }) || keycapProduct.options[0]
  )
}

interface ManualSelectionState {
  housing: Product | null
  pcb: Product | null
  switchPart: Product | null
  keycap: Product | null
}

interface BuildData {
  housing: Product
  pcb: Product
  switchPart: Product
  keycap: Product
  assemblyFee?: number
  totalPrice: number
}

export default function CustomBuilderPage() {
  const router = useRouter()
  const { addItem, openCart } = useCart()
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')

  // --- 수동 선택 상태 ---
  const [currentStep, setCurrentStep] = useState<number>(1) // 1: 하우징, 2: 기판, 3: 스위치, 4: 키캡
  const [manualSelection, setManualSelection] = useState<ManualSelectionState>({
    housing: null,
    pcb: null,
    switchPart: null,
    keycap: null,
  })
  const [includeAssembly, setIncludeAssembly] = useState(true) // 조립 대행 공임비(20,000원)

  // --- 자동 추천(설문) 상태 ---
  const [surveyStep, setSurveyStep] = useState<number>(1)
  const [surveyAnswers, setSurveyAnswers] = useState({
    layout: '87',
    connectivity: 'any',
    soundPref: 'thock',
    keycapStyle: 'PBT',
  })
  const [recommendedBuild, setRecommendedBuild] = useState<BuildData | null>(null)

  // ==================== 부품 목록 데이터 분리 ====================
  const allHousings = MOCK_PRODUCTS.filter((p) => p.parentCategoryId === 'housing')
  const allPcbs = MOCK_PRODUCTS.filter(
    (p) => p.parentCategoryId === 'keyboards' || p.parentCategoryId === 'pcb',
  )
  const allSwitches = MOCK_PRODUCTS.filter(
    (p) => p.parentCategoryId === 'switches' || p.parentCategoryId === 'switch',
  )
  const allKeycaps = MOCK_PRODUCTS.filter(
    (p) => p.parentCategoryId === 'keycaps' || p.parentCategoryId === 'keycap',
  )

  // ==================== 수동 모드 호환 필터 ====================
  // 1. 호환 기판: 선택된 하우징의 layout과 일치
  const compatiblePcbs = manualSelection.housing
    ? allPcbs.filter((pcb) => pcb.layout === manualSelection.housing?.layout)
    : allPcbs

  // 2. 호환 스위치: 선택된 기판의 supportPins 규격 만족 (기판 없으면 전체 허용)
  const compatibleSwitches = manualSelection.pcb
    ? allSwitches.filter((sw) => {
        const pins = manualSelection.pcb?.supportPins || [3, 5]
        return sw.pin ? pins.includes(sw.pin) : true
      })
    : allSwitches

  // 수동 부품 선택 및 선택 해제(토글) 핸들러
  const handleSelectPart = (category: keyof ManualSelectionState, product: Product) => {
    const isUnavailable =
      product.stockQuantity <= 0 ||
      Boolean(product.isSoldOut) ||
      product.status === 'SOLD_OUT' ||
      product.status === 'DISCONTINUED'

    if (isUnavailable) {
      alert(
        `[${product.name}]\n해당 부품은 현재 품절 또는 판매 중지 상태이므로 선택할 수 없습니다.`,
      )
      return
    }

    setManualSelection((prev) => {
      const isAlreadySelected = prev[category]?.productId === product.productId

      // 이미 선택된 아이템 재클릭 시 선택 해제
      if (isAlreadySelected) {
        const next: ManualSelectionState = { ...prev, [category]: null }
        if (category === 'housing') {
          next.pcb = null
          if (next.keycap) {
            next.keycap = { ...next.keycap, selectedOption: null }
          }
        }
        return next
      }

      // 부품 신규 선택
      const itemToSelect: Product = { ...product }

      // 키캡 선택 시 하우징이 이미 선택되어 있으면 해당 배열 옵션 자동 부여
      if (category === 'keycap') {
        const matchedOption = prev.housing
          ? getMatchingKeycapOption(product, prev.housing.layout)
          : product.options?.[0] || null
        itemToSelect.selectedOption = matchedOption
      }

      const next: ManualSelectionState = { ...prev, [category]: itemToSelect }

      // 하우징 변경 시 규격 재검증
      if (category === 'housing') {
        if (prev.pcb && prev.pcb.layout !== product.layout) {
          next.pcb = null
        }
        if (prev.keycap) {
          const reMatchedOption = getMatchingKeycapOption(prev.keycap, product.layout)
          next.keycap = { ...prev.keycap, selectedOption: reMatchedOption }
        }
      }

      return next
    })
  }

  // 수동 견적 합계 계산
  const getManualTotalPrice = () => {
    let total = 0
    if (manualSelection.housing) total += manualSelection.housing.basePrice
    if (manualSelection.pcb) total += manualSelection.pcb.basePrice
    if (manualSelection.switchPart) total += manualSelection.switchPart.basePrice
    if (manualSelection.keycap) {
      total += manualSelection.keycap.basePrice
      if (manualSelection.keycap.selectedOption?.additionalPrice) {
        total += manualSelection.keycap.selectedOption.additionalPrice
      }
    }
    if (includeAssembly) total += 20000
    return total
  }

  // ==================== 자동 추천 알고리즘 로직 ====================
  const handleGenerateRecommendation = () => {
    const availableHousings = allHousings.filter(
      (h) => !h.isSoldOut && h.stockQuantity > 0 && h.status !== 'DISCONTINUED',
    )
    const housingCandidates = availableHousings.length > 0 ? availableHousings : allHousings
    const matchedHousing =
      housingCandidates.find((h) => h.layout === surveyAnswers.layout) || housingCandidates[0]

    if (!matchedHousing) {
      alert('추천 가능한 하우징 부품이 없습니다.')
      return
    }

    const availablePcbs = allPcbs.filter(
      (p) => !p.isSoldOut && p.stockQuantity > 0 && p.status !== 'DISCONTINUED',
    )
    const pcbCandidates = availablePcbs.length > 0 ? availablePcbs : allPcbs

    let matchedPcb = pcbCandidates.find(
      (pcb) =>
        pcb.layout === matchedHousing.layout &&
        (surveyAnswers.connectivity === 'wireless' ? pcb.isWireless : true),
    )
    if (!matchedPcb) {
      matchedPcb =
        pcbCandidates.find((pcb) => pcb.layout === matchedHousing.layout) || pcbCandidates[0]
    }
    if (!matchedPcb) {
      alert('추천 가능한 기판 부품이 없습니다.')
      return
    }

    const availableSwitches = allSwitches.filter(
      (s) => !s.isSoldOut && s.stockQuantity > 0 && s.status !== 'DISCONTINUED',
    )
    const switchCandidates = availableSwitches.length > 0 ? availableSwitches : allSwitches

    let matchedSwitch = switchCandidates.find(
      (sw) =>
        sw.soundType === surveyAnswers.soundPref &&
        (matchedPcb.supportPins || [3, 5]).includes(sw.pin || 3),
    )
    if (!matchedSwitch) {
      matchedSwitch =
        switchCandidates.find((sw) => (matchedPcb.supportPins || [3, 5]).includes(sw.pin || 3)) ||
        switchCandidates[0]
    }
    if (!matchedSwitch) {
      alert('추천 가능한 스위치 부품이 없습니다.')
      return
    }

    const availableKeycaps = allKeycaps.filter(
      (k) => !k.isSoldOut && k.stockQuantity > 0 && k.status !== 'DISCONTINUED',
    )
    const keycapCandidates = availableKeycaps.length > 0 ? availableKeycaps : allKeycaps

    const matchedKeycap =
      keycapCandidates.find((k) => k.material === surveyAnswers.keycapStyle) || keycapCandidates[0]
    if (!matchedKeycap) {
      alert('추천 가능한 키캡 부품이 없습니다.')
      return
    }

    const matchedKeycapOption = getMatchingKeycapOption(matchedKeycap, matchedHousing.layout)
    const keycapExtraPrice = matchedKeycapOption?.additionalPrice || 0

    const housingPrice = matchedHousing.basePrice || 0
    const pcbPrice = matchedPcb.basePrice || 0
    const switchPrice = matchedSwitch.basePrice || 0
    const keycapPrice = matchedKeycap.basePrice || 0

    setRecommendedBuild({
      housing: matchedHousing,
      pcb: matchedPcb,
      switchPart: matchedSwitch,
      keycap: {
        ...matchedKeycap,
        selectedOption: matchedKeycapOption,
      },
      assemblyFee: 20000,
      totalPrice: housingPrice + pcbPrice + switchPrice + keycapPrice + keycapExtraPrice + 20000,
    })
    setSurveyStep(5)
  }

  // 장바구니 담기 핸들러 (팀 장바구니에 4개 부품 전달)
  const handleAddBuildToCart = (build: BuildData) => {
    const parts = [
      { p: build.housing, opt: null },
      { p: build.pcb, opt: null },
      { p: build.switchPart, opt: null },
      { p: build.keycap, opt: build.keycap.selectedOption },
    ]

    parts.forEach(({ p, opt }) => {
      addItem({
        productId: String(p.productId),
        slug: String(p.productId),
        name: `[커스텀] ${p.name}`,
        image: p.thumbnailUrl,
        optionValue: opt ? String(opt.optionId) : undefined,
        optionLabel: opt?.optionName,
        unitPrice: p.basePrice + (opt?.additionalPrice || 0),
        shippingFee: 0,
        quantity: 1,
      })
    })

    openCart()
    alert(
      `[커스텀 키보드 구성품 4종]\n` +
        `- 하우징: ${build.housing.name} (${build.housing.layout}%)\n` +
        `- 기판: ${build.pcb.name}\n` +
        `- 스위치: ${build.switchPart.name}\n` +
        `- 키캡: ${build.keycap.name} ${build.keycap.selectedOption ? `(${build.keycap.selectedOption.optionName})` : ''}\n` +
        `${includeAssembly ? '+ 조립 대행 공임비 (20,000원)\n' : ''}\n` +
        `총 금액 ${formatPrice(build.totalPrice)}이 장바구니에 담겼습니다.`,
    )
  }

  // 수동 빌드 장바구니 담기
  const handleManualAddToCart = () => {
    if (
      !manualSelection.housing ||
      !manualSelection.pcb ||
      !manualSelection.switchPart ||
      !manualSelection.keycap
    ) {
      alert('모든 부품(하우징, 기판, 스위치, 키캡)을 1개씩 모두 선택해주세요.')
      return
    }

    const build: BuildData = {
      housing: manualSelection.housing,
      pcb: manualSelection.pcb,
      switchPart: manualSelection.switchPart,
      keycap: manualSelection.keycap,
      assemblyFee: includeAssembly ? 20000 : 0,
      totalPrice: getManualTotalPrice(),
    }

    handleAddBuildToCart(build)
  }

  // 수동 모드 현재 스텝의 상품 목록
  const getCurrentStepItems = (): {
    list: Product[]
    label: string
    field: keyof ManualSelectionState
  } => {
    switch (currentStep) {
      case 1:
        return { list: allHousings, label: '하우징 (HOUSING)', field: 'housing' }
      case 2:
        return { list: compatiblePcbs, label: '기판 (PCB / KEYBOARD)', field: 'pcb' }
      case 3:
        return { list: compatibleSwitches, label: '스위치 (SWITCHES)', field: 'switchPart' }
      case 4:
        return { list: allKeycaps, label: '키캡 (KEYCAPS)', field: 'keycap' }
      default:
        return { list: allHousings, label: '하우징 (HOUSING)', field: 'housing' }
    }
  }

  const { list: activeList, label: activeStepLabel, field: activeField } = getCurrentStepItems()
  const isAllManualSelected = Boolean(
    manualSelection.housing &&
    manualSelection.pcb &&
    manualSelection.switchPart &&
    manualSelection.keycap,
  )

  return (
    <section className="mx-auto w-[min(80%,1440px)] py-14 max-lg:w-[92%]">
      {/* 헤더 섹션 */}
      <div className="mb-12 border-b border-zinc-200 pb-8 text-center">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-zinc-500">CUSTOM STUDIO</p>
        <h1 className="text-5xl font-medium tracking-[-0.05em] max-md:text-3xl">
          Build Your Custom Keyboard.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
          복잡한 규격과 호환성 검증은 빌더가 처리합니다. 원하는 디자인과 타건감을 자유롭게
          완성하세요.
        </p>

        {/* 빌더 모드 스위처 */}
        <div className="mt-8 inline-flex rounded-full bg-zinc-100 p-1.5">
          <button
            className={`rounded-full px-6 py-2 text-xs font-semibold tracking-wider transition ${
              mode === 'auto'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
            onClick={() => setMode('auto')}
            type="button"
          >
            ⚡ 맞춤 설문 추천 (AUTO)
          </button>
          <button
            className={`rounded-full px-6 py-2 text-xs font-semibold tracking-wider transition ${
              mode === 'manual'
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
            onClick={() => setMode('manual')}
            type="button"
          >
            🛠️ 직접 부품 조립 (MANUAL)
          </button>
        </div>
      </div>

      {/* ========================================================
          [MODE A]: 자동 맞춤 설문형 모드 (AUTO)
          ======================================================== */}
      {mode === 'auto' && (
        <div className="mx-auto max-w-3xl">
          {surveyStep <= 4 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
              <div className="mb-6 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold tracking-widest text-zinc-950">
                  QUESTION 0{surveyStep} / 04
                </span>
                <span>{surveyStep * 25}% COMPLETE</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full bg-zinc-950 transition-all duration-300"
                  style={{ width: `${surveyStep * 25}%` }}
                />
              </div>

              {/* Question 1: Layout */}
              {surveyStep === 1 && (
                <div>
                  <h2 className="text-2xl font-medium tracking-tight">
                    선호하시는 키보드 배열 크기를 선택해주세요.
                  </h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    책상 공간과 주로 사용하는 키 구성에 따라 선택하세요.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                    {[
                      {
                        val: '87',
                        label: '87키 텐키리스',
                        desc: '가장 대중적이며 표준적인 밸런스',
                      },
                      {
                        val: '75',
                        label: '75% 콤팩트',
                        desc: '방향키와 펑션키를 알차게 압축한 크기',
                      },
                      {
                        val: '65',
                        label: '65% 미니멀',
                        desc: '책상을 가장 넓게 쓰는 휴대성 최적화',
                      },
                    ].map((opt) => (
                      <button
                        className={`rounded-xl border p-5 text-left transition ${
                          surveyAnswers.layout === opt.val
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                        key={opt.val}
                        onClick={() => setSurveyAnswers((prev) => ({ ...prev, layout: opt.val }))}
                        type="button"
                      >
                        <p className="text-base font-semibold">{opt.label}</p>
                        <p
                          className={`mt-2 text-xs ${surveyAnswers.layout === opt.val ? 'text-zinc-300' : 'text-zinc-500'}`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 2: Connectivity */}
              {surveyStep === 2 && (
                <div>
                  <h2 className="text-2xl font-medium tracking-tight">
                    원하시는 연결 방식을 선택해주세요.
                  </h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    무선 블루투스 지원 여부에 따라 기판이 결정됩니다.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                    {[
                      {
                        val: 'wireless',
                        label: '유무선 / 블루투스',
                        desc: '선 없는 깔끔한 데스크셋업',
                      },
                      { val: 'wired', label: '유선 전용', desc: '안정적인 초저지연 반응속도' },
                      { val: 'any', label: '상관 없음', desc: '가장 호환성이 좋은 기판 우선' },
                    ].map((opt) => (
                      <button
                        className={`rounded-xl border p-5 text-left transition ${
                          surveyAnswers.connectivity === opt.val
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                        key={opt.val}
                        onClick={() =>
                          setSurveyAnswers((prev) => ({ ...prev, connectivity: opt.val }))
                        }
                        type="button"
                      >
                        <p className="text-base font-semibold">{opt.label}</p>
                        <p
                          className={`mt-2 text-xs ${surveyAnswers.connectivity === opt.val ? 'text-zinc-300' : 'text-zinc-500'}`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 3: Sound */}
              {surveyStep === 3 && (
                <div>
                  <h2 className="text-2xl font-medium tracking-tight">
                    선호하시는 타건음과 타건감을 선택해주세요.
                  </h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    스위치 성향에 따라 고유의 타건 사운드가 만들어집니다.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    {[
                      {
                        val: 'thock',
                        label: '깊고 묵직한 조약돌 (Thock)',
                        desc: '바닥을 때리는 묵직한 로우피치 사운드',
                      },
                      {
                        val: 'clack',
                        label: '카랑카랑한 또각또각 (Clack)',
                        desc: '경쾌하고 선명한 하이피치 사운드',
                      },
                      {
                        val: 'silent',
                        label: '사무실용 저소음 (Silent)',
                        desc: '소음을 극한으로 억제한 정숙한 타건감',
                      },
                      {
                        val: 'clicky',
                        label: '시원한 찰칵찰칵 (Clicky)',
                        desc: '기계식 특유의 명확한 클릭 구분감',
                      },
                    ].map((opt) => (
                      <button
                        className={`rounded-xl border p-5 text-left transition ${
                          surveyAnswers.soundPref === opt.val
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                        key={opt.val}
                        onClick={() =>
                          setSurveyAnswers((prev) => ({ ...prev, soundPref: opt.val }))
                        }
                        type="button"
                      >
                        <p className="text-base font-semibold">{opt.label}</p>
                        <p
                          className={`mt-2 text-xs ${surveyAnswers.soundPref === opt.val ? 'text-zinc-300' : 'text-zinc-500'}`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 4: Keycap Material */}
              {surveyStep === 4 && (
                <div>
                  <h2 className="text-2xl font-medium tracking-tight">
                    선호하시는 키캡 재질을 선택해주세요.
                  </h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    손끝에 닿는 촉감과 번들거림 내구성에 영향을 줍니다.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    {[
                      {
                        val: 'PBT',
                        label: 'PBT (뽀송하고 내구성 우수)',
                        desc: '장시간 사용에도 번들거림이 적고 뽀송한 촉감',
                      },
                      {
                        val: 'ABS',
                        label: 'ABS (선명한 색감과 매끄러움)',
                        desc: '선명한 각인 표현과 매끄럽고 찰진 촉감',
                      },
                    ].map((opt) => (
                      <button
                        className={`rounded-xl border p-5 text-left transition ${
                          surveyAnswers.keycapStyle === opt.val
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                        key={opt.val}
                        onClick={() =>
                          setSurveyAnswers((prev) => ({ ...prev, keycapStyle: opt.val }))
                        }
                        type="button"
                      >
                        <p className="text-base font-semibold">{opt.label}</p>
                        <p
                          className={`mt-2 text-xs ${surveyAnswers.keycapStyle === opt.val ? 'text-zinc-300' : 'text-zinc-500'}`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 하단 네비게이션 버튼 */}
              <div className="mt-10 flex items-center justify-between border-t border-zinc-100 pt-6">
                <button
                  className="text-xs font-semibold text-zinc-500 hover:text-black disabled:opacity-30"
                  disabled={surveyStep === 1}
                  onClick={() => setSurveyStep((prev) => Math.max(1, prev - 1))}
                  type="button"
                >
                  ← 이전 단계
                </button>

                {surveyStep < 4 ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
                    onClick={() => setSurveyStep((prev) => prev + 1)}
                    type="button"
                  >
                    다음 단계 <ArrowIcon />
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-3 text-xs font-semibold tracking-wider text-white transition hover:bg-zinc-800"
                    onClick={handleGenerateRecommendation}
                    type="button"
                  >
                    ⚡ 맞춤 견적 확인하기
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* 추천 결과 화면 (Step 5) */
            recommendedBuild && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
                <div className="mb-8 border-b border-zinc-200 pb-6 text-center">
                  <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold tracking-widest text-zinc-800">
                    RECOMMENDED BUILD
                  </span>
                  <h2 className="mt-3 text-3xl font-medium tracking-tight">
                    고객님의 취향에 맞춘 최적의 조립 조합
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    규격 충돌 없이 100% 호환되는 프리미엄 키보드 빌드입니다.
                  </p>
                </div>

                {/* 4개 추천 부품 그리드 */}
                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  {[
                    {
                      label: '하우징',
                      item: recommendedBuild.housing,
                      extra: `${recommendedBuild.housing.layout}% 배열`,
                    },
                    {
                      label: '기판',
                      item: recommendedBuild.pcb,
                      extra: recommendedBuild.pcb.isWireless ? '유무선 블루투스' : '유선 전용',
                    },
                    {
                      label: '스위치',
                      item: recommendedBuild.switchPart,
                      extra: `${recommendedBuild.switchPart.soundType} 사운드`,
                    },
                    {
                      label: '키캡',
                      item: recommendedBuild.keycap,
                      extra:
                        recommendedBuild.keycap.selectedOption?.optionName ||
                        recommendedBuild.keycap.material,
                    },
                  ].map(({ label, item, extra }) => (
                    <div
                      className="flex gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
                      key={label}
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        <Image
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="80px"
                          src={item.thumbnailUrl}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                          {label}
                        </span>
                        <h4 className="truncate text-sm font-semibold text-zinc-900">
                          {item.name}
                        </h4>
                        <p className="text-xs text-zinc-500">{extra}</p>
                        <p className="mt-2 text-xs font-semibold text-zinc-950">
                          {formatPrice(
                            item.basePrice + (item.selectedOption?.additionalPrice || 0),
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 공임비 및 총액 계산 영역 */}
                <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-100/60 p-6">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-800">
                      <input
                        checked={includeAssembly}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                        onChange={(e) => {
                          const checked = e.target.checked
                          setIncludeAssembly(checked)
                          setRecommendedBuild((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  assemblyFee: checked ? 20000 : 0,
                                  totalPrice:
                                    prev.housing.basePrice +
                                    prev.pcb.basePrice +
                                    prev.switchPart.basePrice +
                                    prev.keycap.basePrice +
                                    (prev.keycap.selectedOption?.additionalPrice || 0) +
                                    (checked ? 20000 : 0),
                                }
                              : null,
                          )
                        }}
                        type="checkbox"
                      />
                      <span>전문 엔지니어 정밀 윤활 & 완제 조립 대행 (+20,000원)</span>
                    </label>
                    <span className="text-xs font-semibold text-zinc-600">
                      {includeAssembly ? '+20,000원' : '직접 조립'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">최종 견적 총액</p>
                      <p className="text-3xl font-medium tracking-tight text-zinc-950">
                        {formatPrice(recommendedBuild.totalPrice)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="rounded-full border border-zinc-300 px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-white"
                        onClick={() => setSurveyStep(1)}
                        type="button"
                      >
                        설문 다시 하기
                      </button>
                      <button
                        className="rounded-full bg-zinc-950 px-7 py-2.5 text-xs font-semibold tracking-wider text-white transition hover:bg-zinc-800 active:scale-[0.99]"
                        onClick={() => handleAddBuildToCart(recommendedBuild)}
                        type="button"
                      >
                        장바구니 담기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ========================================================
          [MODE B]: 직접 부품 조립 모드 (MANUAL)
          ======================================================== */}
      {mode === 'manual' && (
        <div className="grid grid-cols-[1fr_360px] gap-10 max-lg:grid-cols-1">
          {/* 좌측: 단계별 부품 선택 영역 */}
          <div>
            {/* 스텝 탭 네비게이션 */}
            <div className="mb-6 grid grid-cols-4 gap-2">
              {[
                { step: 1, title: '1. 하우징', selected: manualSelection.housing },
                { step: 2, title: '2. 기판 (PCB)', selected: manualSelection.pcb },
                { step: 3, title: '3. 스위치', selected: manualSelection.switchPart },
                { step: 4, title: '4. 키캡', selected: manualSelection.keycap },
              ].map(({ step, title, selected }) => {
                const isActive = currentStep === step
                return (
                  <button
                    className={`rounded-xl border p-3.5 text-left transition ${
                      isActive
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                        : selected
                          ? 'border-zinc-300 bg-zinc-100/70 text-zinc-900'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                    }`}
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    type="button"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{title}</span>
                      {selected && (
                        <span className="text-[10px] text-emerald-600 font-bold">✓ 선택완료</span>
                      )}
                    </div>
                    <p
                      className={`mt-1 truncate text-xs ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}
                    >
                      {selected ? selected.name : '미선택'}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* 현재 스텝 안내 띠 */}
            <div className="mb-6 flex items-center justify-between rounded-lg bg-zinc-100 px-4 py-3 text-xs text-zinc-700">
              <span className="font-semibold">{activeStepLabel}</span>
              <span>
                {currentStep === 2 && manualSelection.housing && (
                  <span className="text-zinc-900 font-medium">
                    (하우징 {manualSelection.housing.layout}% 배열 호환 기판만 표시 중)
                  </span>
                )}
                {currentStep === 3 && manualSelection.pcb && (
                  <span className="text-zinc-900 font-medium">
                    (기판 {manualSelection.pcb.supportPins?.join(', ')}핀 규격 호환 스위치만 표시
                    중)
                  </span>
                )}
                {currentStep === 4 && manualSelection.housing && (
                  <span className="text-zinc-900 font-medium">
                    (하우징 {manualSelection.housing.layout}% 배열 키캡 옵션 자동 적용)
                  </span>
                )}
              </span>
            </div>

            {/* 상품 카드 목록 그리드 */}
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
              {activeList.map((item) => {
                const isSelected = manualSelection[activeField]?.productId === item.productId
                const isUnavailable =
                  item.stockQuantity <= 0 ||
                  Boolean(item.isSoldOut) ||
                  item.status === 'SOLD_OUT' ||
                  item.status === 'DISCONTINUED'

                return (
                  <button
                    className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-zinc-950 ring-2 ring-zinc-950 ring-offset-2'
                        : isUnavailable
                          ? 'cursor-not-allowed opacity-50 border-zinc-200 bg-zinc-50'
                          : 'border-zinc-200 bg-white hover:border-zinc-400'
                    }`}
                    disabled={isUnavailable}
                    key={item.productId}
                    onClick={() => handleSelectPart(activeField, item)}
                    type="button"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                      <Image
                        alt={item.name}
                        className="object-cover transition duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        src={item.thumbnailUrl}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-950">
                            ✓ 선택됨
                          </span>
                        </div>
                      )}
                      {isUnavailable && (
                        <span className="absolute right-2 top-2 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-white font-semibold">
                          품절
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                        {item.subCategoryName || item.categoryId}
                      </p>
                      <h4 className="mt-1 truncate text-sm font-semibold text-zinc-900">
                        {item.name}
                      </h4>
                      <p className="mt-2 text-xs font-semibold text-zinc-950">
                        {formatPrice(item.basePrice)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 우측: 실시간 견적 요약 사이드바 */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <h3 className="text-base font-semibold tracking-tight text-zinc-900 border-b border-zinc-200 pb-3">
                선택 부품 견적서
              </h3>

              <div className="my-5 space-y-4">
                {[
                  { label: '하우징', part: manualSelection.housing },
                  { label: '기판', part: manualSelection.pcb },
                  { label: '스위치', part: manualSelection.switchPart },
                  {
                    label: '키캡',
                    part: manualSelection.keycap,
                    extra: manualSelection.keycap?.selectedOption
                      ? ` (${manualSelection.keycap.selectedOption.optionName})`
                      : '',
                  },
                ].map(({ label, part, extra }) => (
                  <div className="flex items-start justify-between text-xs" key={label}>
                    <div className="min-w-0 pr-3">
                      <span className="font-semibold text-zinc-500 uppercase">{label}:</span>{' '}
                      <span className="font-medium text-zinc-900 truncate block">
                        {part ? (
                          `${part.name}${extra || ''}`
                        ) : (
                          <span className="text-zinc-400">선택 대기</span>
                        )}
                      </span>
                    </div>
                    <span className="shrink-0 font-semibold text-zinc-950">
                      {part
                        ? formatPrice(part.basePrice + (part.selectedOption?.additionalPrice || 0))
                        : '-'}
                    </span>
                  </div>
                ))}
              </div>

              {/* 공임비 옵션 */}
              <div className="border-t border-zinc-200 pt-4">
                <label className="flex cursor-pointer items-center justify-between text-xs font-medium text-zinc-700">
                  <span className="flex items-center gap-2">
                    <input
                      checked={includeAssembly}
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                      onChange={(e) => setIncludeAssembly(e.target.checked)}
                      type="checkbox"
                    />
                    <span>조립 대행 서비스</span>
                  </span>
                  <span className="font-semibold">{includeAssembly ? '+20,000원' : '0원'}</span>
                </label>
              </div>

              {/* 총액 */}
              <div className="mt-6 border-t border-zinc-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-zinc-500">합계 견적</span>
                  <span className="text-2xl font-medium tracking-tight text-zinc-950">
                    {formatPrice(getManualTotalPrice())}
                  </span>
                </div>

                <button
                  className="mt-6 w-full rounded-md bg-zinc-950 py-3 text-xs font-semibold tracking-wider text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                  disabled={!isAllManualSelected}
                  onClick={handleManualAddToCart}
                  type="button"
                >
                  {isAllManualSelected ? '커스텀 견적 장바구니 담기' : '부품을 모두 선택해주세요'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
