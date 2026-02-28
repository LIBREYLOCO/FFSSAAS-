import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixHuellitas() {
    console.log("Checking Veterinaries...");
    const vets = await prisma.veterinaryClinic.findMany();

    for (const vet of vets) {
        if (vet.businessName.includes("Huellitas Felices")) {
            console.log(`Found ${vet.businessName}. Current rate: ${vet.referralCommissionRate}`);

            await prisma.veterinaryClinic.update({
                where: { id: vet.id },
                data: { referralCommissionRate: 500 }
            });
            console.log(`Updated ${vet.businessName} to 500`);
        }
    }
}

fixHuellitas()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
