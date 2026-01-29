
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Define validation schema
const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name } = userSchema.parse(body)

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { user: null, message: "User with this email already exists" },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hash(password, 10)

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                // Role defaults to USER based on schema usually, but explicit is good if needed.
                // Assuming default role handling in schema or it's optional.
            },
        })

        // Remove password from response
        const { password: newUserPassword, ...rest } = newUser

        return NextResponse.json(
            { user: rest, message: "User created successfully" },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { user: null, message: "Invalid input", errors: error.issues },
                { status: 400 }
            )
        }

        console.error("Registration error:", error)
        return NextResponse.json(
            { user: null, message: "Something went wrong" },
            { status: 500 }
        )
    }
}
