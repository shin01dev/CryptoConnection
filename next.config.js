/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['uploadthing.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    // appDir 프로퍼티를 제거했습니다.
  }
}

module.exports = nextConfig
