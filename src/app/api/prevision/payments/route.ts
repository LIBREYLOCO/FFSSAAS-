import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contractId, amount, type } = body;

        if (!contractId || !amount || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const contract = await prisma.previsionContract.findUnique({
            where: { id: contractId },
            include: { plan: true, payments: true }
        });

        if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

        // Record the payment
        const payment = await prisma.payment.create({
            data: {
                contractId,
                amount,
                type,
                status: "PAID" // Default for manual entry in this flow
            }
        });

        // Check if fully paid
        const totalPaid = contract.payments.reduce((acc, p) => acc + p.amount, 0) + amount;
        if (totalPaid >= contract.plan.price) {
            await prisma.previsionContract.update({
                where: { id: contractId },
                data: { status: "COMPLETED" }
            });
        }

        return NextResponse.json(payment);
    } catch (error) {
        console.error("Error creating payment:", error);
        return NextResponse.json({ error: "Error creating payment" }, { status: 500 });
    }
}
