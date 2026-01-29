import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content, excerpt, published, featured, tags, image, category, authorId, publishedAt } = body

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    })

    if (existingBlog) {
      return NextResponse.json(
        { error: "A blog with this slug already exists" },
        { status: 400 }
      )
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        published: published || false,
        featured: featured || false,
        tags: tags || null,
        image: image || null,
        category: category || null,
        authorId,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    })

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(blogs)
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    )
  }
}
