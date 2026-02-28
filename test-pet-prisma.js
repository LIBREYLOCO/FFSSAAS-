const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const pet = await prisma.pet.findFirst();
        if (!pet) {
            console.log("No pets found");
            return;
        }

        const clinic = await prisma.veterinaryClinic.findFirst();
        if (!clinic) {
            console.log("No clinics found");
            return;
        }

        console.log(`Attempting to update pet ${pet.id} with clinic ${clinic.id}`);

        const result = await prisma.pet.update({
            where: { id: pet.id },
            data: {
                referralSource: "VETERINARIA",
                clinicId: clinic.id
            }
        });

        console.log("SUCCESS:", result);
    } catch (error) {
        console.error("PRISMA ERROR:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
