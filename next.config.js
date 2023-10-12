/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['uploadthing.com', 'lh3.googleusercontent.com'],
  },
  // 추가된 headers 함수
  async headers() {
    return [
      {
        // 모든 경로에 이 헤더를 적용합니다.
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
  experimental: {
    // appDir 프로퍼티를 제거했습니다.
  }
}

module.exports = nextConfig
