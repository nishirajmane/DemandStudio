
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

        const contentType = await prisma.contentType.findUnique({
            where: { id: params.id },
            include: {
                fields: {
                    orderBy: { order: "asc" },
                },
            },
        })

        if (!contentType) {
            return NextResponse.json({ error: "Content type not found" }, { status: 404 })
        }

        return NextResponse.json(contentType)
    } catch (error) {
        console.error("Error fetching content type:", error)
        return NextResponse.json({ error: "Failed to fetch content type" }, { status: 500 })
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
        const { name, description, fields } = body

        // Updates basic info and handles fields transactionally if needed
        // For simplicity, we'll update the type and then handle fields logic if provided
        // Ideally, fields management might be separate or part of this. 
        // Here implies a full update of fields structure.

        const contentType = await prisma.$transaction(async (tx) => {
            // Update basic info
            const updatedConf = await tx.contentType.update({
                where: { id: params.id },
                data: {
                    name,
                    description,
                },
                include: {
                    fields: {
                        orderBy: { order: "asc" },
                    },
                },
            })

            if (fields && Array.isArray(fields)) {
                // Delete existing fields not present in update (if we are doing full sync)
                // Or simplified: This endpoint might just update metadata, 
                // and a separate endpoint or logic handles fields. 
                // Let's assume this updates fields too.

                // 1. Delete all existing fields (simplest strategy for full sync editor)
                //    OR update efficiently. Let's delete and recreate/create-many for simplicity 
                //    BUT this destroys data references if not careful. 
                //    Better: Upsert based on ID.

                for (const [index, field] of fields.entries()) {
                    const fieldData = {
                        name: field.name,
                        key: field.key,
                        type: field.type,
                        required: field.required ?? false,
                        options: field.options ? JSON.stringify(field.options) : null,
                        order: index,
                        contentTypeId: params.id,
                    }

                    if (field.id && !field.id.startsWith("temp-")) {
                        await tx.contentField.update({
                            where: { id: field.id },
                            data: fieldData,
                        })
                    } else {
                        await tx.contentField.create({
                            data: fieldData,
                        })
                    }
                }

                // Handle deletions: keys/ids not in the new list should be deleted?
                // For now, let's trust the user or add specific delete logic if requested.
                // To be safe, let's keep it additive/update for now.
            }

            return updatedConf
        })

        return NextResponse.json(contentType)

    } catch (error) {
        console.error("Error updating content type:", error)
        return NextResponse.json({ error: "Failed to update content type" }, { status: 500 })
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

        await prisma.contentType.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting content type:", error)
        return NextResponse.json({ error: "Failed to delete content type" }, { status: 500 })
    }
}
