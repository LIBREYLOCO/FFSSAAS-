import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const [contracts, serviceOrders] = await Promise.all([
            // Active contracts with remaining balance
            prisma.previsionContract.findMany({
                where: { status: "ACTIVE" },
                include: {
                    owner: { select: { id: true, name: true, phone: true } },
                    plan: { select: { name: true, price: true, installmentsCount: true } },
                    payments: { select: { amount: true, status: true, createdAt: true, type: true } },
                },
                orderBy: { createdAt: "asc" },
            }),
            // Service orders with outstanding balance
            prisma.serviceOrder.findMany({
                where: { balanceDue: { gt: 0 } },
                include: {
                    owner: { select: { id: true, name: true, phone: true } },
                    pet: { select: { name: true, species: true } },
                },
                orderBy: { createdAt: "asc" },
            }),
        ]);

        // Compute remaining balance per contract
        const contractsWithBalance = contracts.map(c => {
            const totalPaid = c.payments.reduce((acc, p) => acc + Number(p.amount), 0);
            const remainingBalance = Math.max(0, Number(c.plan.price) - totalPaid);
            return {
                id: c.id,
                owner: c.owner,
                planName: c.plan.name,
                planPrice: Number(c.plan.price),
                installmentsCount: c.plan.installmentsCount,
                installmentAmount: Number(c.installmentAmount),
                totalPaid,
                remainingBalance,
                paymentsCount: c.payments.length,
                lastPaymentDate: c.payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt ?? null,
            };
        }).filter(c => c.remainingBalance > 0);

        const serviceOrdersFormatted = serviceOrders.map(o => ({
            id: o.id,
            folio: o.folio,
            owner: o.owner,
            petName: o.pet?.name ?? "Sin nombre",
            petSpecies: o.pet?.species ?? "",
            totalCost: Number(o.totalCost),
            balanceDue: Number(o.balanceDue),
            serviceType: o.serviceType,
            status: o.status,
            createdAt: o.createdAt,
        }));

        const totalPendingContracts = contractsWithBalance.reduce((acc, c) => acc + c.installmentAmount, 0);
        const totalPendingOrders = serviceOrdersFormatted.reduce((acc, o) => acc + o.balanceDue, 0);

        return NextResponse.json({
            contracts: contractsWithBalance,
            serviceOrders: serviceOrdersFormatted,
            totals: {
                pendingContracts: contractsWithBalance.length,
                pendingOrders: serviceOrdersFormatted.length,
                totalPendingContracts,
                totalPendingOrders,
                grandTotal: totalPendingContracts + totalPendingOrders,
            },
        });
    } catch (error: any) {
        console.error("Cobranza API error:", error);
        return NextResponse.json({ error: error.message || "Error al obtener cobranza" }, { status: 500 });
    }
}
