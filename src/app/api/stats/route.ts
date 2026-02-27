import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(request: NextRequest) {
    const role = request.headers.get("x-user-role");
    const headerSucursalId = request.headers.get("x-user-sucursal-id");
    const queryParam = request.nextUrl.searchParams.get("sucursalId");

    // GERENTE_SUCURSAL solo ve su sucursal; ADMIN puede filtrar opcionalmente
    const sucursalId = role === "GERENTE_SUCURSAL"
        ? (headerSucursalId ?? undefined)
        : (queryParam ?? undefined);

    const orderFilter = sucursalId ? { sucursalId } : {};

    try {
        const [ownerCount, petCount, contractCount, serviceOrders, payments] = await Promise.all([
            prisma.owner.count(),
            prisma.pet.count(),
            prisma.previsionContract.count({ where: { status: "ACTIVE" } }),
            prisma.serviceOrder.findMany({
                where: orderFilter,
                select: {
                    totalCost: true,
                    createdAt: true,
                    serviceType: true
                }
            }),
            prisma.payment.findMany({ select: { amount: true, paymentDate: true } })
        ]);

        const totalRevenue =
            serviceOrders.reduce((sum: number, order: any) => sum + Number(order.totalCost || 0), 0) +
            payments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);

        // --- CHART DATA: Revenue by Month (Last 6 Months) ---
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            const monthLabel = format(date, "MMM");

            const monthlyOrders = serviceOrders.filter(o => o.createdAt >= monthStart && o.createdAt <= monthEnd);
            const monthlyPayments = payments.filter(p => (p.paymentDate || new Date()) >= monthStart && (p.paymentDate || new Date()) <= monthEnd);

            const revenue =
                monthlyOrders.reduce((sum, o) => sum + Number(o.totalCost || 0), 0) +
                monthlyPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

            monthlyRevenue.push({ name: monthLabel, revenue });
        }

        // --- CHART DATA: Service Distribution ---
        const distribution: Record<string, number> = {};
        serviceOrders.forEach(o => {
            const type = o.serviceType || "Otro";
            distribution[type] = (distribution[type] || 0) + 1;
        });
        const serviceDistribution = Object.entries(distribution).map(([name, value]) => ({ name, value }));

        const stats = [
            { label: "Clientes Totales", value: ownerCount.toString(), icon: "Users", color: "text-brand-gold-500" },
            { label: "Mascotas Activas", value: petCount.toString(), icon: "Dog", color: "text-brand-gold-100" },
            { label: "Planes Previsión", value: contractCount.toString(), icon: "HeartHandshake", color: "text-accent-500" },
            { label: "Ingresos Totales", value: `$${totalRevenue.toLocaleString()}`, icon: "TrendingUp", color: "text-white" },
        ];

        return NextResponse.json({
            stats,
            recentActivity: await prisma.serviceOrder.findMany({
                where: orderFilter,
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { pet: true, owner: true }
            }),
            totalRevenue,
            monthlyRevenue,
            serviceDistribution
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Error fetching dashboard stats" }, { status: 500 });
    }
}
