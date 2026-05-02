import type { NextConfig } from 'next'

const IMAGE_REMOTE_HOST = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOST
const DELOY_ENV = process.env.NEXT_PUBLIC_DEPLOY_ENV || 'development'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  basePath: '',
  compiler: {
    removeConsole: DELOY_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'lodash',
      '@radix-ui/react-icons',
    ],
  },
  images: {
    remotePatterns: IMAGE_REMOTE_HOST
      ? [
          {
            protocol: 'https',
            hostname: IMAGE_REMOTE_HOST,
          },
          {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
          },
          {
            protocol: 'https',
            hostname: 'imagedelivery.net',
          },
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
          },
          {
            protocol: 'https',
            hostname: 'picsum.photos',
          },
          // Cloudflare R2 — phase 1 public dev URL
          {
            protocol: 'https',
            hostname: 'pub-444e165e3cc34721a5620508f66c58b0.r2.dev',
          },
          // Cloudflare R2 — phase 2 custom CDN domain (provisioned later)
          {
            protocol: 'https',
            hostname: 'cdn.smartrent.io.vn',
          },
        ]
      : [
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
          },
          {
            protocol: 'https',
            hostname: 'picsum.photos',
          },
          {
            protocol: 'https',
            hostname: 'pub-444e165e3cc34721a5620508f66c58b0.r2.dev',
          },
          {
            protocol: 'https',
            hostname: 'cdn.smartrent.io.vn',
          },
        ],
    qualities: [75, 85, 90, 100],
  },
}

export default nextConfig
