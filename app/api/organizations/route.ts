
import { auth } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"
import * as z from "zod"

const orgCreateSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
})

export async function GET(req: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const orgs = await db.organization.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            select: {
                id: true,
                name: true,
                slug: true
            }
        })

        return NextResponse.json(orgs)
    } catch (error) {
        return new NextResponse(null, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // TODO: Verify if user is superadmin if restricting org creation
        // For now, allow logged in users to create orgs to test

        const json = await req.json()
        const body = orgCreateSchema.parse(json)

        // Check if slug exists
        const existing = await db.organization.findUnique({
            where: { slug: body.slug }
        })

        if (existing) {
            return new NextResponse("Organization with this slug already exists", { status: 409 })
        }

        const org = await db.organization.create({
            data: {
                name: body.name,
                slug: body.slug,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER"
                    }
                }
            }
        })

        return NextResponse.json(org)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }

        console.error("ORG CREATE ERROR:", error)
        return new NextResponse(null, { status: 500 })
    }
}
