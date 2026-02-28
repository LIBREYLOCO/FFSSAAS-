import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const salespeople = await prisma.salesperson.findMany({
            include: {
                _count: { select: { contracts: true } },
                sucursal: { select: { nombre: true, codigo: true } },
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(salespeople);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching salespeople" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, level, commissionRate } = body;

        if (!name || !level) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newPerson = await prisma.salesperson.create({
            data: {
                name,
                level,
                commissionRate: Number(commissionRate) || 0.1
            }
        });

        return NextResponse.json(newPerson);
    } catch (error) {
        return NextResponse.json({ error: "Error creating salesperson" }, { status: 500 });
    }
}
