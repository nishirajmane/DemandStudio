
import { auth } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"
import * as z from "zod"

const routeContextSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
})

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const session = await auth()

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const project = await db.project.findUnique({
            where: { id: params.id },
            select: { organizationId: true }
        })

        if (!project) {
            return new NextResponse("Not Found", { status: 404 })
        }

        // Check membership
        const membership = await db.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: project.organizationId,
                    userId: session.user.id,
                },
            },
        })

        if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await db.project.delete({
            where: {
                id: params.id,
            },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }

        return new NextResponse(null, { status: 500 })
    }
}
