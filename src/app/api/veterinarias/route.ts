import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const veterinaries = await prisma.veterinaryClinic.findMany({
            include: {
                _count: {
                    select: { referredPets: true }
                }
            },
            orderBy: { businessName: 'asc' }
        });

        const mappedVeterinaries = veterinaries.map(v => ({
            ...v,
            name: v.businessName,
            fixedFee: Number(v.referralCommissionRate || 0),
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
        const {
            name, fixedFee, taxId, contactName, phone,
            // Structured address fields
            streetName, streetNumber, interiorNum, neighborhood,
            city, state, country, zipCode,
            latitude, longitude,
        } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const newVet = await prisma.veterinaryClinic.create({
            data: {
                businessName: name,
                taxId: taxId || null,
                contactName: contactName || null,
                phone: phone || null,
                streetName: streetName || null,
                streetNumber: streetNumber || null,
                interiorNum: interiorNum || null,
                neighborhood: neighborhood || null,
                city: city || null,
                state: state || null,
                country: country || null,
                zipCode: zipCode || null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                referralCommissionRate: fixedFee ? parseFloat(fixedFee.toString()) : 0,
            }
        });

        return NextResponse.json({
            ...newVet,
            name: newVet.businessName,
            fixedFee: Number(newVet.referralCommissionRate || 0),
        });
    } catch (error) {
        return NextResponse.json({ error: "Error creating veterinary" }, { status: 500 });
    }
}
