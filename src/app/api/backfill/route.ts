import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        console.log("Starting backfill of SesionCremacion for COMPLETED orders...");

        const completedOrdersWithoutSession = await prisma.serviceOrder.findMany({
            where: {
                status: "COMPLETED",
                sesionCremacion: null
            }
        });

        if (completedOrdersWithoutSession.length === 0) {
            return NextResponse.json({ message: "Nothing to do." });
        }

        const horno = await prisma.horno.findFirst();
        if (!horno) {
            return NextResponse.json({ error: "No Horno found." }, { status: 400 });
        }

        const year = new Date().getFullYear();
        let countThisYear = await prisma.sesionCremacion.count({
            where: { createdAt: { gte: new Date(`${year}-01-01`) } },
        });

        let createdCount = 0;
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
            createdCount++;
        }

        return NextResponse.json({ message: `Successfully backfilled ${createdCount} orders.` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
