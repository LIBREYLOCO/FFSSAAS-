import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillCremationSessions() {
    console.log("Starting backfill of SesionCremacion for COMPLETED orders...");

    // Find all COMPLETED service orders that lack a SesionCremacion
    const completedOrdersWithoutSession = await prisma.serviceOrder.findMany({
        where: {
            status: "COMPLETED",
            sesionCremacion: null
        }
    });

    console.log(`Found ${completedOrdersWithoutSession.length} orders lacking a cremation session.`);

    if (completedOrdersWithoutSession.length === 0) {
        console.log("Nothing to do.");
        return;
    }

    const horno = await prisma.horno.findFirst();
    if (!horno) {
        console.error("No Horno found in the database. Cannot backfill.");
        return;
    }

    const year = new Date().getFullYear();
    let countThisYear = await prisma.sesionCremacion.count({
        where: { createdAt: { gte: new Date(`${year}-01-01`) } },
    });

    for (const order of completedOrdersWithoutSession) {
        countThisYear++;
        const sequential = String(countThisYear).padStart(4, "0");
        const numeroCertificado = `CERT-${year}-${sequential}`;

        await prisma.sesionCremacion.create({
            data: {
                numeroCertificado,
                hornoId: horno.id,
                serviceOrderId: order.id,
                operadorNombre: "Sistema Automático (Backfill)",
                fechaInicio: new Date(),
                fechaFin: new Date(),
                observaciones: "Generado automáticamente para historial antiguo",
            }
        });

        console.log(`Created session ${numeroCertificado} for order ${order.folio}`);
    }

    console.log("Backfill complete.");
}

backfillCremationSessions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
