import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { name: "asc" }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("[PRODUCTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, price, stock, category, sku } = body;

        if (!name || !price) {
            return new NextResponse("Name and price are required", { status: 400 });
        }

        // Simple SKU generation if not provided
        const finalSku = sku || `ACC-${Date.now().toString().slice(-6)}`;

        const product = await prisma.product.create({
            data: {
                sku: finalSku,
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                category: category || "ACCESSORY",
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
