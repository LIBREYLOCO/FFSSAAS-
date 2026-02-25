import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                price: parseFloat(body.price),
                stock: parseInt(body.stock),
                category: body.category
            }
        });
        return NextResponse.json(product);
    } catch (error) {
        console.error("Inventory PUT Error:", error);
        return NextResponse.json({ error: "Error updating product" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Inventory DELETE Error:", error);
        return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
    }
}
