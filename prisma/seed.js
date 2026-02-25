const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const masterUser = await prisma.user.upsert({
        where: { email: 'stdmexico@me.com' },
        update: {
            password: 'Libreilocos72',
            role: 'ADMIN',
            name: 'Master Admin'
        },
        create: {
            email: 'stdmexico@me.com',
            name: 'Master Admin',
            password: 'Libreilocos72', // Nota: Debería usarse hashing en producción
            role: 'ADMIN',
        },
    });
    console.log({ masterUser });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
