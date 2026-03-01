import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const [clinics, orders, drivers] = await Promise.all([
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
            }),
            prisma.driver.findMany({
                where: {
                    isActive: true,
                    currentLat: { not: null },
                    currentLng: { not: null },
                    lastLocationAt: { gte: fiveMinutesAgo },
                },
            }),
        ]);

        return NextResponse.json({
            clinics,
            activeOrders: orders,
            activeDrivers: drivers,
        });
    } catch (error) {
        console.error("Map API Error:", error);
        return NextResponse.json({ error: "Error fetching map data" }, { status: 500 });
    }
}
