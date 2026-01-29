import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 400 }
      )
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        password: hashedPassword,
        role: "admin",
      },
    })

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: { email: user.email, name: user.name },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error seeding user:", error)
    return NextResponse.json(
      { error: "Failed to seed user" },
      { status: 500 }
    )
  }
}

