
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import * as z from "zod"

const routeContextSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
})

export async function DELETE(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        const { params } = routeContextSchema.parse(context)
        const session = await auth()

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Check permissions
        // Allow if user is OWNER of the org OR SUPERADMIN (future)
        const membership = await db.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: params.id,
                    userId: session.user.id,
                },
            },
        })

        // TODO: Add Superadmin check here too
        if (!membership || membership.role !== "OWNER") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await db.organization.delete({
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
