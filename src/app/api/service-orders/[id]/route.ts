import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Missing status" }, { status: 400 });
        }

        const updatedOrder = await prisma.serviceOrder.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating service order status:", error);
        return NextResponse.json({ error: "Error updating status" }, { status: 500 });
    }
}
