import { NextRequest } from 'next/server'
import { corsMiddleware, corsHeaders } from '@/lib/cors'
import { apiSuccessResponse } from '@/lib/api-auth'

export async function OPTIONS(request: NextRequest) {
  return corsMiddleware(request) || new Response(null, { status: 200 })
}

export async function GET(request: NextRequest) {
  const corsResponse = corsMiddleware(request)
  if (corsResponse) return corsResponse

  return apiSuccessResponse(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    200,
    request
  )
}

