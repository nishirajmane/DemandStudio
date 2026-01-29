
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to Prisma...')
        const blogs = await prisma.blog.findMany({ take: 1 })
        console.log('Successfully fetched blogs:', blogs)
    } catch (e) {
        console.error('Error fetching blogs:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
