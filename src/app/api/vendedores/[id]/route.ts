import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const person = await prisma.salesperson.findUnique({
            where: { id },
            include: {
                sucursal: { select: { nombre: true, codigo: true } },
                commissions: {
                    include: {
                        payment: true,
                        contract: {
                            include: {
                                owner: { select: { name: true } },
                                plan: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                contracts: {
                    include: {
                        owner: { select: { name: true } },
                        plan: { select: { name: true, price: true } },
                        payments: { orderBy: { paymentDate: 'desc' } },
                    },
                    orderBy: { startDate: 'desc' },
                },
            },
        });
        if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(person);
    } catch (error: any) {
        return NextResponse.json({ error: "Error fetching salesperson", detail: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            name, level, commissionRate, previsionCommissionRate, phone, email, photoUrl,
            streetName, streetNumber, interiorNum, neighborhood,
            city, state, country, zipCode, latitude, longitude,
        } = body;

        const updated = await prisma.salesperson.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(level !== undefined && { level }),
                ...(commissionRate !== undefined && { commissionRate: Number(String(commissionRate).replace(',', '.')) || 0 }),
                ...(previsionCommissionRate !== undefined && { previsionCommissionRate: Number(String(previsionCommissionRate).replace(',', '.')) || 0 }),
                ...(phone !== undefined && { phone }),
                ...(email !== undefined && { email }),
                ...(photoUrl !== undefined && { photoUrl }),
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
