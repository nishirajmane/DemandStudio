
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const contentTypeSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only"),
    description: z.string().optional(),
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const contentTypes = await prisma.contentType.findMany({
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(contentTypes)
    } catch (error) {
        console.error("Error fetching content types:", error)
        return NextResponse.json({ error: "Failed to fetch content types" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = contentTypeSchema.parse(body)

        // Check for existing slug
        const existing = await prisma.contentType.findUnique({
            where: { slug: validatedData.slug },
        })

        if (existing) {
            return NextResponse.json({ error: "Context type with this slug already exists" }, { status: 400 })
        }

        const contentType = await prisma.contentType.create({
            data: validatedData,
        })

        return NextResponse.json(contentType)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        console.error("Error creating content type:", error)
        return NextResponse.json({ error: "Failed to create content type" }, { status: 500 })
    }
}
