import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreation() {
    const payload = {
        name: "Test Vet Prisma Flow",
        fixedFee: 850,
        contactName: "Dr. Prisma"
    };

    console.log("Saving payload:", payload);

    const newVet = await prisma.veterinaryClinic.create({
        data: {
            businessName: payload.name,
            contactName: payload.contactName,
            referralCommissionRate: payload.fixedFee ? parseFloat(payload.fixedFee.toString()) : 0,
        }
    });

    console.log("Saved Vet:", newVet);
}

testCreation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
