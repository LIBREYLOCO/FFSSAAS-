import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const plans = await prisma.previsionPlan.findMany({
            orderBy: { price: 'asc' }
        });
        return NextResponse.json(plans);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching plans" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, installmentsCount } = body;

        if (!name || !price || !installmentsCount) {
            return NextResponse.json({ error: "Name, price and installmentsCount are required" }, { status: 400 });
        }

        const plan = await prisma.previsionPlan.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                installmentsCount: parseInt(installmentsCount, 10),
            }
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error: any) {
        console.error("Error creating plan:", error);
        return NextResponse.json({ error: "Error creating plan", details: error.message }, { status: 500 });
    }
}
