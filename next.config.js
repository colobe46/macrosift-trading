/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { serverComponentsExternalPackages: ['@prisma/client', 'ioredis'] },
  images: { domains: ['img.clerk.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'] },
}
module.exports = nextConfig
