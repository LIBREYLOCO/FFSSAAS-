import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            name, level, commissionRate, phone, email,
            streetName, streetNumber, interiorNum, neighborhood,
            city, state, country, zipCode, latitude, longitude,
        } = body;

        const updated = await prisma.salesperson.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(level !== undefined && { level }),
                ...(commissionRate !== undefined && { commissionRate: Number(commissionRate) }),
                ...(phone !== undefined && { phone }),
                ...(email !== undefined && { email }),
                ...(streetName !== undefined && { streetName }),
                ...(streetNumber !== undefined && { streetNumber }),
                ...(interiorNum !== undefined && { interiorNum }),
                ...(neighborhood !== undefined && { neighborhood }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(country !== undefined && { country }),
                ...(zipCode !== undefined && { zipCode }),
                ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
                ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
            },
            include: {
                _count: { select: { contracts: true } },
                sucursal: { select: { nombre: true, codigo: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("[vendedores/PATCH]", error);
        return NextResponse.json({ error: "Error updating salesperson", detail: error.message }, { status: 500 });
    }
}
