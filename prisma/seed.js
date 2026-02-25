const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aura.lat' },
        update: {},
        create: {
            email: 'admin@aura.lat',
            name: 'Admin Aura',
            password: 'aura_password_2026', // En producción usar hashing
            role: 'ADMIN',
        },
    });
    console.log({ admin });
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
