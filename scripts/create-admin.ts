import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = "admin@demandifymedia.com"
    const password = "admin123"

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        console.log(`User ${email} already exists. Updating password...`)
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        })
        console.log("Password updated successfully!")
    } else {
        console.log(`Creating user ${email}...`)
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                email,
                name: "Admin User",
                password: hashedPassword,
                role: "admin",
            },
        })
        console.log("User created successfully!")
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
