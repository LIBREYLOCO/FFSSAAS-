import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    const role = request.headers.get("x-user-role");
    const headerSucursalId = request.headers.get("x-user-sucursal-id");
    const queryParam = request.nextUrl.searchParams.get("sucursalId");

    // GERENTE_SUCURSAL ve solo su inventario; ADMIN puede filtrar opcionalmente
    const sucursalId = role === "GERENTE_SUCURSAL"
        ? (headerSucursalId ?? undefined)
        : (queryParam ?? undefined);

    try {
        const products = await prisma.product.findMany({
            where: sucursalId ? { sucursalId } : {},
            orderBy: { name: 'asc' },
            include: { sucursal: { select: { nombre: true, codigo: true } } },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Inventory GET Error:", error);
        return NextResponse.json({ error: "Error fetching inventory" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const sucursalId = request.headers.get("x-user-sucursal-id") ?? undefined;

    try {
        const body = await request.json();
        const sku = body.sku || `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const product = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: body.price,
                stock: parseInt(body.stock),
                category: body.category,
                sku: sku,
                ...(body.sucursalId && { sucursalId: body.sucursalId }),
                ...(!body.sucursalId && sucursalId && { sucursalId }),
            }
        });
        return NextResponse.json(product);
    } catch (error) {
        console.error("Inventory POST Error:", error);
        return NextResponse.json({ error: "Error creating product" }, { status: 500 });
    }
}
