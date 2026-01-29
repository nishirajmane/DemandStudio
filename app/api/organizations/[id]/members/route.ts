
import { auth } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"
import * as z from "zod"

const memberAddSchema = z.object({
    email: z.string().email(),
    role: z.string().default("MEMBER"),
    password: z.string().optional(),
})

const memberUpdateSchema = z.object({
    memberId: z.string(),
    role: z.string(),
})

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const routeParams = await params;
        const session = await auth()

        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const json = await req.json()
        const body = memberAddSchema.parse(json)

        // Find user
        let user = await db.user.findUnique({
            where: { email: body.email }
        })

        // If user doesn't exist, create them
        if (!user) {
            if (!body.password) {
                return new NextResponse("User not found. Please provide a password to create a new user.", { status: 400 })
            }

            const bcrypt = await import("bcryptjs")
            const hashedPassword = await bcrypt.hash(body.password, 10)

            user = await db.user.create({
                data: {
                    email: body.email,
                    name: body.email.split("@")[0], // Default name from email part
                    password: hashedPassword,
                    role: "user", // Default system role
                }
            })
        }

        // Check availability
        const existing = await db.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: routeParams.id,
                    userId: user.id
                }
            }
        })

        if (existing) {
            return new NextResponse("User is already a member", { status: 409 })
        }

        const member = await db.organizationMember.create({
            data: {
                organizationId: routeParams.id,
                userId: user.id,
                role: body.role
            },
            include: {
                user: true
            }
        })

        return NextResponse.json(member)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }
        console.error("ADD MEMBER ERROR:", error)
        return new NextResponse(null, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const routeParams = await params;
        const session = await auth()
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const memberId = searchParams.get("memberId")

        if (!memberId) {
            return new NextResponse("Member ID required", { status: 400 })
        }

        await db.organizationMember.delete({
            where: {
                id: memberId,
                organizationId: routeParams.id
            }
        })

        return new NextResponse(null, { status: 200 })
    } catch (error) {
        return new NextResponse(null, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const routeParams = await params;
        const session = await auth()
        if (!session || session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const json = await req.json()
        const body = memberUpdateSchema.parse(json)

        const member = await db.organizationMember.update({
            where: {
                id: body.memberId,
                organizationId: routeParams.id
            },
            data: {
                role: body.role
            },
            include: { user: true }
        })

        return NextResponse.json(member)
    } catch (error) {
        return new NextResponse(null, { status: 500 })
    }
}
