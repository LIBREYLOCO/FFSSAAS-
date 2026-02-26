import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const templates = await prisma.contractTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(templates);
    } catch (error: any) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, content } = body;

        if (!name || !category || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const template = await prisma.contractTemplate.create({
            data: {
                name,
                category,
                content,
                isActive: true,
            },
        });

        return NextResponse.json(template);
    } catch (error: any) {
        console.error("Error creating template:", error);
        return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 500 });
    }
}
