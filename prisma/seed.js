const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const masterEmail = 'stdmexico@me.com';
    const masterPassword = 'Libreyloco72'; // Actualizado según el último reporte del usuario

    const masterUser = await prisma.user.upsert({
        where: { email: masterEmail },
        update: {
            password: masterPassword,
            role: 'ADMIN',
            name: 'Master Admin'
        },
        create: {
            email: masterEmail,
            name: 'Master Admin',
            password: masterPassword,
            role: 'ADMIN',
        },
    });
    console.log({
        message: "Master user synchronized",
        email: masterUser.email,
        passwordMatch: masterUser.password === masterPassword ? "YES" : "NO"
    });
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
