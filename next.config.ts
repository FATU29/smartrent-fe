import type { NextConfig } from 'next'

const IMAGE_REMOTE_HOST = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOST

const nextConfig: NextConfig = {
  reactStrictMode: false,
  basePath: '',
  output: 'standalone', // Enable standalone output for Docker
  images: {
    remotePatterns: IMAGE_REMOTE_HOST
      ? [
          {
            protocol: 'https',
            hostname: IMAGE_REMOTE_HOST,
            // pathname: '/media/**' // optional, for more strict matching
          },
        ]
      : [],
  },
}

export default nextConfig
