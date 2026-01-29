import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { corsMiddleware, corsHeaders } from '@/lib/cors'
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api-auth'

export async function OPTIONS(request: NextRequest) {
  return corsMiddleware(request) || new Response(null, { status: 200 })
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params
  // Handle CORS preflight
  const corsResponse = corsMiddleware(request)
  if (corsResponse) return corsResponse

  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!blog) {
      return apiErrorResponse('Blog not found', 404, request)
    }

    // Only return published blogs in public API (unless authenticated)
    if (!blog.published) {
      return apiErrorResponse('Blog not found', 404, request)
    }

    return apiSuccessResponse({ data: blog }, 200, request)
  } catch (error) {
    console.error('Error fetching blog:', error)
    return apiErrorResponse('Failed to fetch blog', 500, request)
  }
}

