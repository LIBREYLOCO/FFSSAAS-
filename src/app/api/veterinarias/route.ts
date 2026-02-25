import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const veterinaries = await prisma.veterinaryClinic.findMany({
            include: {
                _count: {
                    select: { referrals: true }
                }
            },
            orderBy: { businessName: 'asc' }
        });

        // Map to expected frontend format
        const mappedVeterinaries = veterinaries.map(v => ({
            ...v,
            name: v.businessName,
            fixedFee: 0 // Default value as it was removed from schema
        }));

        return NextResponse.json(mappedVeterinaries);
    } catch (error) {
        console.error("Error fetching veterinaries:", error);
        return NextResponse.json({ error: "Error fetching veterinaries" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, fixedFee } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const newVet = await prisma.veterinaryClinic.create({
            data: {
                businessName: name,
                // fixedFee: Number(fixedFee) || 500 // Field removed from schema
            }
        });

        return NextResponse.json({
            ...newVet,
            name: newVet.businessName,
            fixedFee: 0
        });
    } catch (error) {
        return NextResponse.json({ error: "Error creating veterinary" }, { status: 500 });
    }
}
