import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contractId, amount, type, notes, products } = body;

        if (!contractId || !amount || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const contract = await tx.previsionContract.findUnique({
                where: { id: contractId },
                include: {
                    plan: true,
                    payments: true,
                    salesperson: true
                }
            });

            if (!contract) throw new Error("Contract not found");

            // 1. Record the payment
            const payment = await tx.payment.create({
                data: {
                    contractId,
                    amount,
                    type,
                    notes: notes || undefined,
                    status: "PAID"
                }
            });

            // 1.5 Create commission if salesperson exists
            if (contract.salesperson) {
                const commissionAmount = Number(amount) * (Number(contract.salesperson.previsionCommissionRate || 0) / 100);
                if (commissionAmount > 0) {
                    await tx.commission.create({
                        data: {
                            salespersonId: contract.salesperson.id,
                            paymentId: payment.id,
                            contractId: contract.id,
                            amount: commissionAmount,
                            status: "PENDING"
                        }
                    });
                }
            }

            // 2. Handle products (deduct stock)
            if (products && Array.isArray(products)) {
                for (const item of products) {
                    await tx.product.update({
                        where: { id: item.id },
                        data: {
                            stock: {
                                decrement: item.quantity || 1
                            }
                        }
                    });
                }
            }

            // 3. Check if fully paid
            const totalPaid = contract.payments.reduce((acc, p) => acc + Number(p.amount), 0) + amount;
            if (totalPaid >= Number(contract.plan.price)) {
                await tx.previsionContract.update({
                    where: { id: contractId },
                    data: { status: "COMPLETED" }
                });
            }

            return payment;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error creating payment:", error);
        return NextResponse.json({ error: error.message || "Error creating payment" }, { status: 500 });
    }
}
