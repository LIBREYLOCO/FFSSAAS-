import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { lat, lng } = await req.json();

        if (typeof lat !== "number" || typeof lng !== "number") {
            return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
        }

        const driver = await prisma.driver.update({
            where: { id },
            data: {
                currentLat: lat,
                currentLng: lng,
                lastLocationAt: new Date(),
            },
            select: { id: true, name: true, currentLat: true, currentLng: true, lastLocationAt: true },
        });

        return NextResponse.json(driver);
    } catch (error: any) {
        console.error("Driver location update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
