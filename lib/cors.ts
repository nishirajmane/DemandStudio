import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*']

export function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin')
  const isAllowedOrigin = allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || '*') : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  }
}

export function corsMiddleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(request),
    })
  }
  return null
}

