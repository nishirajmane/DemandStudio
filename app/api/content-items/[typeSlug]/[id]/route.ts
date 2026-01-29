
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ typeSlug: string; id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const item = await prisma.contentItem.findUnique({
            where: { id: params.id },
            include: {
                contentType: true
            }
        })

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 })
        }

        if (item.contentType.slug !== params.typeSlug) {
            return NextResponse.json({ error: "Item type mismatch" }, { status: 400 })
        }

        return NextResponse.json({
            ...item,
            data: JSON.parse(item.data),
        })
    } catch (error) {
        console.error("Error fetching content item:", error)
        return NextResponse.json({ error: "Failed to fetch content item" }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ typeSlug: string; id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { data, published } = body

        const item = await prisma.contentItem.update({
            where: { id: params.id },
            data: {
                data: JSON.stringify(data),
                published: published,
            },
        })

        return NextResponse.json({
            ...item,
            data: JSON.parse(item.data),
        })
    } catch (error) {
        console.error("Error updating content item:", error)
        return NextResponse.json({ error: "Failed to update content item" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ typeSlug: string; id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.contentItem.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting content item:", error)
        return NextResponse.json({ error: "Failed to delete content item" }, { status: 500 })
    }
}
