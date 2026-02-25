import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    try {
        const products = await prisma.product.findMany()
        console.log('Products found:', products.length)
        process.exit(0)
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
