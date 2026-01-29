import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  })

  if (existingUser) {
    console.log("Admin user already exists!")
    return
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

  console.log("Admin user created successfully!")
  console.log("Email:", user.email)
  console.log("Password: admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

