import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApiKey } from "@prisma/client"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    // Don't return the full key, just a masked version
    const maskedKeys = apiKeys.map((key: ApiKey) => ({
      id: key.id,
      name: key.name,
      key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      active: key.active,
    }))

    return NextResponse.json({ data: maskedKeys })
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, expiresInDays } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Generate a secure API key
    const apiKey = `cms_${crypto.randomBytes(32).toString('hex')}`

    // Calculate expiration date if provided
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const keyRecord = await prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        userId: session.user.id,
        expiresAt,
        active: true,
      },
    })

    // Return the full key only on creation
    return NextResponse.json(
      {
        data: {
          id: keyRecord.id,
          name: keyRecord.name,
          key: apiKey, // Only return full key on creation
          expiresAt: keyRecord.expiresAt,
          createdAt: keyRecord.createdAt,
        },
        message: "API key created successfully. Save this key securely - it won't be shown again!",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    )
  }
}

