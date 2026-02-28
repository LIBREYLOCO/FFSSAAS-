import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const STATUS_FLOW = [
    "PENDING_PICKUP",
    "IN_TRANSIT",
    "AT_CREMATORY",
    "CREMATING",
    "READY_FOR_DELIVERY",
    "DELIVERED",
    "COMPLETED"
];

export async function PATCH(request: Request) {
    try {
        const { orderId, newStatus, note } = await request.json();

        if (!orderId || !newStatus) {
            return NextResponse.json({ error: "Missing orderId or newStatus" }, { status: 400 });
        }

        if (!STATUS_FLOW.includes(newStatus)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        const updated = await prisma.serviceOrder.update({
            where: { id: orderId },
            data: { status: newStatus, updatedAt: new Date() },
            include: { pet: true, owner: true, sesionCremacion: true }
        });

        // Auto-generate Cremation Session if COMPLETED but missing one (User bypassed the Oven Tab)
        if (newStatus === "COMPLETED" && !updated.sesionCremacion) {
            const horno = await prisma.horno.findFirst();
            if (horno) {
                const year = new Date().getFullYear();
                const countThisYear = await prisma.sesionCremacion.count({
                    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
                });
                const sequential = String(countThisYear + 1).padStart(4, "0");
                const numeroCertificado = `CERT-${year}-${sequential}`;

                await prisma.sesionCremacion.create({
                    data: {
                        numeroCertificado,
                        hornoId: horno.id,
                        serviceOrderId: orderId,
                        operadorNombre: "Sistema Automático",
                        fechaInicio: new Date(),
                        fechaFin: new Date(),
                        observaciones: "Generado automáticamente al completar el servicio",
                    }
                });
            }
        }

        // Create a tracking log entry
        await prisma.trackingLog.create({
            data: {
                serviceOrderId: orderId,
                event: `Estado actualizado a: ${newStatus}${note ? ` - ${note}` : ""}`,
                scannedBy: "Operador",
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Error updating order status:", error);
        return NextResponse.json({ error: error.message || "Error updating status" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const activeStatuses = ["PENDING_PICKUP", "IN_TRANSIT", "AT_CREMATORY", "CREMATING", "READY_FOR_DELIVERY"];
        const orders = await prisma.serviceOrder.findMany({
            where: { status: { in: activeStatuses } },
            include: {
                pet: { include: { owner: true } },
                owner: true,
                sesionCremacion: { include: { horno: true } },
                trackingLogs: {
                    orderBy: { timestamp: "desc" },
                    take: 1
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Error fetching orders" }, { status: 500 });
    }
}
