# MONO / KEYS · 팀 작업용 화면 틀

현재 쇼핑몰의 화면 디자인과 페이지 이동을 보존한 Next.js App Router + React + TypeScript 프론트엔드입니다. 이 폴더는 디자인 시안과 화면 흐름을 로컬에서 확인하는 팀 작업용 복사본입니다.

## 로컬 실행

Node.js 24를 사용합니다.

```bash
corepack enable
pnpm install
pnpm dev
```

설치 후 `npm run dev`로 실행해도 됩니다. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 여세요.

상품 목록과 상세 화면은 샘플 데이터로 표시됩니다. 페이지 이동, 카테고리 화면 전환, 헤더 검색 패널, 로그인 패널, 장바구니 패널은 화면 확인용으로 남아 있습니다. 실제 로그인, 회원가입 API, 우편번호 서비스, 장바구니 저장, 주문 제출, 관리자 권한/API는 연결하지 않았으며 각 기능 파일에 TODO를 남겼습니다.

## 팀원별 담당 폴더

| 담당                               | 작업 폴더                | 주요 화면/파일                                                            | TODO 범위                                                                |
| ---------------------------------- | ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1. 로그인 / 로그아웃               | `src/features/auth/`     | `src/components/store-shell.tsx`, `src/components/common/site-header.tsx` | `api.ts`의 로그인·로그아웃·세션 함수 구현 후 로그인 패널과 연결          |
| 2. 회원가입 / 회원탈퇴             | `src/features/user/`     | `src/app/(frontend)/signup/`                                              | `api.ts` 구현, 주소 검색과 회원가입 제출 연결, 마이페이지/탈퇴 화면 추가 |
| 3. 장바구니 추가 / 장바구니 / 주문 | `src/features/cart/`     | `cart-provider.tsx`, `cart-drawer.tsx`, `src/app/(frontend)/checkout/`    | 상품 추가·수정·삭제, 선택 합계, 저장, 주문 API와 성공 흐름 구현          |
| 4. 상품 전체 / 카테고리 / 상세     | `src/features/products/` | `src/app/(frontend)/products/`, 홈 `src/app/(frontend)/page.tsx`          | `api.ts` 구현 후 샘플 데이터 대신 API 데이터 연결                        |
| 5. 관리자 상품 관리                | `src/features/admin/`    | `src/app/(admin)/admin/products/`                                         | 관리자 권한 및 상품 조회·등록·수정·삭제 API 연결                         |

## 폴더 구성

```text
src/
├─ app/
│  ├─ (frontend)/                 # 홈, 상품, 회원가입, 체크아웃 페이지 경로
│  └─ (admin)/admin/products/     # 관리자 상품 페이지 경로
├─ components/
│  ├─ common/                     # 공용 헤더/검색, 상품 카드
│  └─ store-shell.tsx             # 공통 헤더와 로그인 패널을 페이지에 조립
├─ features/
│  ├─ auth/                       # 1번 담당: 로그인·로그아웃 API TODO
│  ├─ user/                       # 2번 담당: 회원 API TODO
│  ├─ cart/                       # 3번 담당: 장바구니·주문 UI/API TODO
│  ├─ products/                   # 4번 담당: 샘플 데이터·상품 UI/API TODO
│  └─ admin/                      # 5번 담당: 관리자 상품 API TODO
└─ lib/                           # 공용 API 요청기, 샘플 데이터 형식, 가격·이미지 도우미
```

Next.js는 `src/app/` 경로를 기준으로 페이지를 찾으므로 페이지 파일은 해당 위치에 둡니다. 팀별 업무 로직은 `src/features/{담당 기능}/`에 추가하고, 반복되는 화면 요소는 `src/components/common/`에서 관리하세요. 여러 기능이 함께 쓰는 `StoreShell`, `CartProvider`, 공용 타입을 바꿀 때는 관련 담당자와 먼저 맞춰 주세요.

## 화면과 로직 분리 기준

- 상품 화면은 `src/features/products/preview-data.ts`의 샘플 데이터를 사용합니다. API 구현 후 페이지에서 `src/features/products/api.ts`를 호출하도록 바꾸세요.
- 기능별 `api.ts` 파일은 호출 함수 형태와 TODO 안내만 갖고 있습니다. 현재 화면에서 이 함수들을 호출하지 않습니다.
- `src/lib/api-client.ts`는 공용 HTTP 요청 도우미입니다. 실제 백엔드 연결 시 주소, 쿠키, 오류 처리 설정을 확인하세요.
- 장바구니 패널은 열고 닫을 수 있지만 상품은 저장하지 않습니다. 로그인/회원가입 제출 및 주문 제출도 서버에 전송되지 않습니다.
- 관리자 대시보드는 디자인 미리보기입니다. 등록/수정/삭제 내용을 서버에 저장하지 않으며 관리자 인증도 하지 않습니다.
- `.env.example`의 `NEXT_PUBLIC_API_BASE_URL`은 백엔드 연결을 시작할 때 사용하세요.

## 빌드

```bash
pnpm build
```
