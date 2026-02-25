const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Clean up
    await prisma.serviceOrder.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.previsionContract.deleteMany({});
    await prisma.pet.deleteMany({});
    await prisma.owner.deleteMany({});
    await prisma.previsionPlan.deleteMany({});
    await prisma.salesperson.deleteMany({});
    await prisma.veterinaryClinic.deleteMany({});

    // Plans
    const planBasico = await prisma.previsionPlan.create({
        data: {
            id: 'plan-basico',
            name: "Plan Esencial Aura",
            description: "Servicio básico de cremación con urna estándar.",
            price: 12000,
            installmentsCount: 12,
        },
    });

    const planPremium = await prisma.previsionPlan.create({
        data: {
            id: 'plan-premium',
            name: "Plan Eternidad Aura",
            description: "Servicio premium con urna de lujo y ceremonia conmemorativa.",
            price: 25000,
            installmentsCount: 24,
        },
    });

    // Salespeople
    const salesperson = await prisma.salesperson.create({
        data: {
            id: 'sales-1',
            name: "Carlos Rodríguez",
            level: "Senior",
            commissionRate: 0.10,
        },
    });

    // Veterinaries
    const veterinary = await prisma.veterinaryClinic.create({
        data: {
            id: 'vet-1',
            businessName: "Clínica Veterinaria Del Bosque",
            // fixedFee: 500, // Removed as it does not exist in schema
        },
    });

    // Case 1: Client with Immediate Service
    const owner1 = await prisma.owner.create({
        data: {
            name: "María García",
            phone: "555-0101",
            pets: {
                create: {
                    name: "Toby",
                    species: "Perro (Golden Retriever)",
                    birthDate: new Date("2012-05-15"),
                    deathDate: new Date(),
                    weightKg: 30.0,
                }
            }
        },
        include: { pets: true }
    });

    await prisma.serviceOrder.create({
        data: {
            ownerId: owner1.id,
            petId: owner1.pets[0].id,
            serviceType: "IMMEDIATE",
            totalCost: 5500,
            balanceDue: 0,
            folio: "ORD-001",
            qrToken: "QR-TOKEN-001",
            status: "COMPLETED",
        }
    });

    // Case 2: Client with Prevision Plan (Active)
    const owner2 = await prisma.owner.create({
        data: {
            name: "José Martínez",
            phone: "555-0202",
            pets: {
                create: {
                    name: "Luna",
                    species: "Gato (Persa)",
                    birthDate: new Date("2020-01-10"),
                    weightKg: 4.0,
                }
            }
        },
        include: { pets: true }
    });

    const contract = await prisma.previsionContract.create({
        data: {
            ownerId: owner2.id,
            planId: planBasico.id,
            salespersonId: salesperson.id,
            downPayment: 1500,
            installmentAmount: 875,
            status: "ACTIVE",
        }
    });

    await prisma.payment.create({
        data: {
            contractId: contract.id,
            amount: 1500,
            type: "DOWN_PAYMENT",
            status: "PAID",
        }
    });

    // Case 3: Client who ALREADY used their Prevision (Service Order from Plan)
    const owner3 = await prisma.owner.create({
        data: {
            name: "Lucía Fernández",
            phone: "555-0303",
            pets: {
                create: {
                    name: "Max",
                    species: "Perro (Beagle)",
                    birthDate: new Date("2010-08-20"),
                    deathDate: new Date("2025-12-01"),
                    weightKg: 10.0,
                }
            }
        },
        include: { pets: true }
    });

    const oldContract = await prisma.previsionContract.create({
        data: {
            ownerId: owner3.id,
            planId: planPremium.id,
            status: "COMPLETED",
            downPayment: 5000,
            installmentAmount: 0, // Paid in full for example
        }
    });

    await prisma.serviceOrder.create({
        data: {
            ownerId: owner3.id,
            petId: owner3.pets[0].id,
            serviceType: "PREVISION",
            contractId: oldContract.id,
            status: "COMPLETED",
            createdAt: new Date("2025-12-02"),
            totalCost: 5000,
            balanceDue: 0,
            folio: "ORD-002",
            qrToken: "QR-TOKEN-002",
        }
    });

    console.log("Seed data created successfully with distinct service types.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
