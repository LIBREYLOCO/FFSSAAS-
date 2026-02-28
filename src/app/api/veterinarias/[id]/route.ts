import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const {
            name, fixedFee, taxId, contactName, phone,
            streetName, streetNumber, interiorNum, neighborhood,
            city, state, country, zipCode,
            latitude, longitude,
        } = body;

        const updatedVet = await prisma.veterinaryClinic.update({
            where: { id },
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

        return NextResponse.json(updatedVet);
    } catch (error: any) {
        console.error("Error updating veterinary:", error);
        return NextResponse.json(
            { error: "Error updating veterinary" },
            { status: 500 }
        );
    }
}
