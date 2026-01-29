
import { auth } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const routeParams = await params;
        const session = await auth()

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Verify membership
        const membership = await db.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: routeParams.id,
                    userId: session.user.id
                }
            }
        })

        if (!membership) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const projects = await db.project.findMany({
            where: {
                organizationId: routeParams.id
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(projects)
    } catch (error) {
        return new NextResponse(null, { status: 500 })
    }
}
