import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(products);
    } catch (error: any) {
        console.error("Inventory GET Error:", error);
        return NextResponse.json({ error: "Error fetching inventory" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Generate SKU if not provided
        const sku = body.sku || `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const product = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: body.price, // Prisma handles string/number -> Decimal
                stock: parseInt(body.stock),
                category: body.category,
                sku: sku
            }
        });
        return NextResponse.json(product);
    } catch (error) {
        console.error("Inventory POST Error:", error);
        return NextResponse.json({ error: "Error creating product" }, { status: 500 });
    }
}
