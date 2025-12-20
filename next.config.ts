import type { NextConfig } from 'next'

const IMAGE_REMOTE_HOST = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOST
const DELOY_ENV = process.env.NEXT_PUBLIC_DEPLOY_ENV || 'development'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  basePath: '',
  compiler: {
    removeConsole: DELOY_ENV === 'production',
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
        ]
      : [
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
          },
        ],
  },
}

export default nextConfig
