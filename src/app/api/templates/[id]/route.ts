import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, category, content, isActive } = body;

        const template = await prisma.contractTemplate.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(category !== undefined && { category }),
                ...(content !== undefined && { content }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(template);
    } catch (error: any) {
        console.error("Error updating template:", error);
        return NextResponse.json({ error: error.message || "Failed to update template" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        // Soft delete (desactivar) en lugar de borrar para mantener histórico
        const template = await prisma.contractTemplate.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json(template);
    } catch (error: any) {
        console.error("Error deleting template:", error);
        return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 });
    }
}
