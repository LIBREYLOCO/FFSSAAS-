import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { amount } = await req.json();
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
        }

        const order = await prisma.serviceOrder.findUnique({ where: { id } });
        if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

        const currentBalance = Number(order.balanceDue);
        if (amount > currentBalance) {
            return NextResponse.json({ error: "El monto excede el saldo pendiente" }, { status: 400 });
        }

        const newBalance = Math.max(0, currentBalance - amount);
        const updated = await prisma.serviceOrder.update({
            where: { id },
            data: { balanceDue: newBalance },
        });

        return NextResponse.json({ balanceDue: Number(updated.balanceDue) });
    } catch (error: any) {
        console.error("Service order payment error:", error);
        return NextResponse.json({ error: error.message || "Error al registrar pago" }, { status: 500 });
    }
}
