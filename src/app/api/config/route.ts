import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const configs = await prisma.systemConfig.findMany();
        return NextResponse.json(configs);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching config" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { key, value, group } = body;

        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { value, group },
            create: { key, value, group }
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Error saving config" }, { status: 500 });
    }
}
