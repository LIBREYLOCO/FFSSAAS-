import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const contracts = await prisma.previsionContract.findMany({
            include: {
                owner: true,
                plan: true,
                payments: true,
                salesperson: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(contracts);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching contracts" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ownerId, planId, salespersonId, downPayment } = body;

        if (!ownerId || !planId || downPayment === undefined) {
            return NextResponse.json({ error: "ownerId, planId, and downPayment are required" }, { status: 400 });
        }

        const plan = await prisma.previsionPlan.findUnique({ where: { id: planId } });
        if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

        const planPrice = Number(plan.price);
        const remainingAmount = planPrice - downPayment;
        const installmentAmount = remainingAmount / plan.installmentsCount;

        const contract = await prisma.previsionContract.create({
            data: {
                ownerId,
                planId,
                salespersonId: salespersonId || null,
                downPayment,
                installmentAmount,
                status: "ACTIVE"
            }
        });

        // Create down payment record
        await prisma.payment.create({
            data: {
                contractId: contract.id,
                amount: downPayment,
                type: "DOWN_PAYMENT",
                status: "PAID"
            }
        });

        return NextResponse.json(contract);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || "Error creating contract" }, { status: 500 });
    }
}
