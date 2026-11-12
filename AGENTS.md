# Frontend project instructions

This is the MONO / KEYS storefront presentation layer. Keep the existing Next.js
routes, React components, styles, and visible behavior intact when making UI
changes. The separate Java Spring Boot application owns business rules,
authentication, product records, inventory, and orders.

## Data access

- Call the Spring Boot REST API through `src/lib/api-client.ts` and the
  feature-specific clients in `src/features/*/`.
- Product pages have a development-only sample catalog fallback when the API is
  unreachable; never use that fixture as production or order data.
- Configure the public API origin with `NEXT_PUBLIC_API_BASE_URL`; local
  development defaults to `http://localhost:8080`.
- Do not add database, CMS, or durable business data logic to this frontend.
- Treat browser submitted product prices and totals as untrusted. The backend
  must resolve prices, stock, permissions, and order totals itself.
- The browser sends requests with credentials so Spring can manage an HttpOnly
  session cookie. The backend must allow the configured frontend origin through
  CORS with credentials enabled.

## Project structure

- `src/app/(frontend)/` contains the public storefront routes.
- `src/app/(admin)/admin/products/` contains the role-gated product dashboard.
- `src/components/common/` contains shared header and product-card UI;
  feature-specific storefront UI lives under `src/features/*/`.
- `src/lib/api-client.ts` contains the REST request helper.
- `src/features/cart/` owns cart state, cart UI, and order API calls.
- `src/features/products/` owns product read calls and product UI.
- `README.md` documents the API contract and local configuration.

## Commands

- `pnpm local` starts the development server on port 3000.
- `pnpm build` creates a production Next.js build and runs TypeScript checks.
- `pnpm format` formats the project with Oxfmt.
