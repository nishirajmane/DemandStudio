import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { corsMiddleware, corsHeaders } from '@/lib/cors'
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api-auth'

export async function OPTIONS(request: NextRequest) {
  return corsMiddleware(request) || new Response(null, { status: 200 })
}

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = corsMiddleware(request)
  if (corsResponse) return corsResponse

  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')

    const where: any = {}

    // Filter by published status
    if (published !== null) {
      where.published = published === 'true'
    } else {
      // Default to only published posts for public API
      where.published = true
    }

    // Filter by featured
    if (featured === 'true') {
      where.featured = true
    }

    // Search in title and content (SQLite compatible)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    // Filter by tags (SQLite compatible - using contains for comma-separated tags)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim())
      where.OR = [
        ...(where.OR || []),
        ...tagArray.map(tag => ({
          tags: { contains: tag },
        })),
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.post.count({ where }),
    ])

    return apiSuccessResponse(
      {
        data: posts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      200,
      request
    )
  } catch (error) {
    console.error('Error fetching posts:', error)
    return apiErrorResponse('Failed to fetch posts', 500, request)
  }
}

