import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const publicOrigin = process.env.FIGMA_PUBLIC_URL
let allowedDevOrigins: string[] = []
if (publicOrigin) {
  try {
    allowedDevOrigins = [new URL(publicOrigin).host]
  } catch {
    // Ignore malformed optional preview origins.
  }
}

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(dirname) },
  output: 'standalone',
  images: {
    loader: 'custom',
    loaderFile: './figma-image-loader.ts',
  },
  allowedDevOrigins,
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.FIGMA_PUBLIC_URL || 'http://localhost:3000',
  },
}

export default nextConfig
