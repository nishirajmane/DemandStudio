import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Verify the API key belongs to the user
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.apiKey.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { active, name } = body

    // Verify the API key belongs to the user
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        ...(active !== undefined && { active }),
        ...(name && { name }),
      },
    })

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        active: updated.active,
        lastUsed: updated.lastUsed,
        expiresAt: updated.expiresAt,
      },
    })
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    )
  }
}

