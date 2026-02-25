import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const plans = await prisma.previsionPlan.findMany();
        return NextResponse.json(plans);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching plans" }, { status: 500 });
    }
}
