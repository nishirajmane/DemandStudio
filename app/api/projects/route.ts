
import { auth } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"
import * as z from "zod"

const projectCreateSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional(),
    organizationId: z.string(),
})

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const json = await req.json()
        const body = projectCreateSchema.parse(json)

        // Check membership
        const membership = await db.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: body.organizationId,
                    userId: session.user.id,
                },
            },
        })

        if (!membership) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Check project slug uniqueness (globally or per org? Schema says unique globally)
        const existing = await db.project.findUnique({
            where: { slug: body.slug }
        })

        if (existing) {
            return new NextResponse("Project with this slug already exists", { status: 409 })
        }

        const project = await db.project.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                organizationId: body.organizationId,
                updatedAt: new Date(),
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }

        console.error("PROJECT CREATION ERROR:", error)
        return new NextResponse(null, { status: 500 })
    }
}
