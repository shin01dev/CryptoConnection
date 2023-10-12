import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // 토큰 가져오기
  const token = await getToken({ req })

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl))
  }

  // 이 부분에 CORS 및 COEP 설정 추가
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*') // 모든 출처에 대한 접근 허용
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp') // COEP 설정
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin') // COOP 설정
  // 필요한 경우 추가적인 CORS 및 보안 관련 헤더를 여기에 추가할 수 있습니다.

  return response // 설정된 헤더와 함께 응답 반환
}

// 특정 경로에 미들웨어 적용
export const config = {
  matcher: ['/r/:path*/submit', '/r/create' ],
}
