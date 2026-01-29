
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ typeSlug: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const publishedOnly = searchParams.get("published") === "true"

        const contentType = await prisma.contentType.findUnique({
            where: { slug: params.typeSlug },
        })

        if (!contentType) {
            return NextResponse.json({ error: "Content type not found" }, { status: 404 })
        }

        const items = await prisma.contentItem.findMany({
            where: {
                contentTypeId: contentType.id,
                ...(publishedOnly ? { published: true } : {}),
            },
            orderBy: { createdAt: "desc" },
        })

        // Parse JSON data for response
        const parsedItems = items.map(item => ({
            ...item,
            data: JSON.parse(item.data),
        }))

        return NextResponse.json(parsedItems)
    } catch (error) {
        console.error("Error fetching content items:", error)
        return NextResponse.json({ error: "Failed to fetch content items" }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ typeSlug: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const contentType = await prisma.contentType.findUnique({
            where: { slug: params.typeSlug },
        })

        if (!contentType) {
            return NextResponse.json({ error: "Content type not found" }, { status: 404 })
        }

        const body = await request.json()
        const { data, published } = body

        // TODO: Add strict validation against fields here if needed

        const item = await prisma.contentItem.create({
            data: {
                contentTypeId: contentType.id,
                data: JSON.stringify(data || {}),
                published: published ?? false,
            },
        })

        return NextResponse.json({
            ...item,
            data: JSON.parse(item.data),
        })
    } catch (error) {
        console.error("Error creating content item:", error)
        return NextResponse.json({ error: "Failed to create content item" }, { status: 500 })
    }
}
