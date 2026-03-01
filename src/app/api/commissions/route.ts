import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { commissionId, status } = body;

        if (!commissionId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updated = await prisma.commission.update({
            where: { id: commissionId },
            data: {
                status,
                paidAt: status === "PAID" ? new Date() : null
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Error updating commission:", error);
        return NextResponse.json({ error: error.message || "Error updating commission" }, { status: 500 });
    }
}
