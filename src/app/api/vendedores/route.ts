import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        // 1. Ensure all active VENDEDOR users have a Salesperson entry
        const vendedorUsers = await prisma.user.findMany({
            where: { role: "VENDEDOR", isActive: true },
            select: { name: true, email: true, sucursalId: true },
        });

        const existingSalespeople = await prisma.salesperson.findMany({
            select: { name: true },
        });
        const existingNames = new Set(existingSalespeople.map((s) => s.name.toLowerCase().trim()));

        for (const user of vendedorUsers) {
            if (!existingNames.has(user.name.toLowerCase().trim())) {
                await prisma.salesperson.create({
                    data: {
                        name: user.name,
                        level: "JUNIOR",
                        commissionRate: 0,
                        previsionCommissionRate: 0,
                        email: user.email ?? undefined,
                        ...(user.sucursalId && { sucursalId: user.sucursalId }),
                    },
                }).catch(() => {}); // ignore duplicates
            }
        }

        // 2. Fetch all salespeople with commission totals
        const salespeople = await prisma.salesperson.findMany({
            include: {
                _count: { select: { contracts: true } },
                sucursal: { select: { nombre: true, codigo: true } },
                commissions: { select: { amount: true, status: true } },
            },
            orderBy: { name: "asc" },
        });

        // 3. Compute accumulated totals per person
        const result = salespeople.map((p) => {
            const totalEarned  = p.commissions.reduce((sum, c) => sum + Number(c.amount), 0);
            const totalPaid    = p.commissions.filter((c) => c.status === "PAID").reduce((sum, c) => sum + Number(c.amount), 0);
            const totalPending = totalEarned - totalPaid;
            const { commissions: _c, ...rest } = p;
            return { ...rest, totalEarned, totalPaid, totalPending };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[vendedores/GET]", error);
        return NextResponse.json({ error: "Error fetching salespeople" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, level, commissionRate, previsionCommissionRate } = body;

        if (!name || !level) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newPerson = await prisma.salesperson.create({
            data: {
                name,
                level,
                commissionRate: Number(commissionRate) || 0,
                previsionCommissionRate: Number(previsionCommissionRate) || 0,
            },
        });

        return NextResponse.json(newPerson);
    } catch (error) {
        return NextResponse.json({ error: "Error creating salesperson" }, { status: 500 });
    }
}
