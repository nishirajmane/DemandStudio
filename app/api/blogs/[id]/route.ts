import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content, excerpt, published, featured, tags, image, category, publishedAt } = body

    // Check if slug already exists for another blog
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    })

    if (existingBlog && existingBlog.id !== params.id) {
      return NextResponse.json(
        { error: "A blog with this slug already exists" },
        { status: 400 }
      )
    }

    const blog = await prisma.blog.update({
      where: { id: params.id },
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
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.blog.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    )
  }
}
