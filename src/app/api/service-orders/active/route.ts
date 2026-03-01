import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const ACTIVE_STATUSES = [
    "PENDING_PICKUP",
    "IN_TRANSIT",
    "AT_CREMATORY",
    "CREMATING",
    "READY_FOR_DELIVERY",
    "DELIVERED",
];

export async function GET() {
    try {
        const orders = await prisma.serviceOrder.findMany({
            where: { status: { in: ACTIVE_STATUSES } },
            select: {
                id: true,
                folio: true,
                status: true,
                serviceType: true,
                createdAt: true,
                pet: { select: { name: true, species: true, breed: true } },
                owner: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
