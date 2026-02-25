const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const products = await prisma.product.findMany()
        console.log('PRISMA_TEST_RESULT: Products count =', products.length)
        process.exit(0)
    } catch (error) {
        console.error('PRISMA_TEST_ERROR:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
