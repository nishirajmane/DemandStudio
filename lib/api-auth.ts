import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import { corsHeaders, corsMiddleware } from './cors'

export async function validateApiKey(request: NextRequest): Promise<{ valid: boolean; userId?: string; error?: string }> {
  // Check for API key in header
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')

  if (!apiKey) {
    return { valid: false, error: 'API key is required' }
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    })

    if (!keyRecord || !keyRecord.active) {
      return { valid: false, error: 'Invalid or inactive API key' }
    }

    // Check if key is expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return { valid: false, error: 'API key has expired' }
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    })

    return { valid: true, userId: keyRecord.userId }
  } catch (error) {
    console.error('API key validation error:', error)
    return { valid: false, error: 'Error validating API key' }
  }
}

export function apiErrorResponse(message: string, status: number = 401, request: NextRequest) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: corsHeaders(request),
    }
  )
}

export function apiSuccessResponse(data: any, status: number = 200, request: NextRequest) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(request),
  })
}

