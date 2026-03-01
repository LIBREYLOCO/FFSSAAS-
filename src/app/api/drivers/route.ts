import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const drivers = await prisma.driver.findMany({
            where: { isActive: true },
            select: { id: true, name: true, licensePlate: true, phone: true },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(drivers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
