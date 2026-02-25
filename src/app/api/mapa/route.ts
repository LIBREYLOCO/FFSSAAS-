import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const [clinics, orders] = await Promise.all([
            prisma.veterinaryClinic.findMany({
                where: {
                    latitude: { not: null },
                    longitude: { not: null }
                }
            }),
            prisma.serviceOrder.findMany({
                where: {
                    status: {
                        in: ["PENDING_PICKUP", "PICKED_UP", "PROCESS"]
                    }
                },
                include: {
                    pet: true,
                    clinic: true
                }
            })
        ]);

        return NextResponse.json({
            clinics,
            activeOrders: orders
        });
    } catch (error) {
        console.error("Map API Error:", error);
        return NextResponse.json({ error: "Error fetching map data" }, { status: 500 });
    }
}
