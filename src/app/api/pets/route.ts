import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const pets = await prisma.pet.findMany({
            include: { owner: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(pets);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching pets" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, species, breed, birthDate, deathDate, ownerId, weightKg, color, photoUrl } = body;

        // weightKg is critical for cremation logic
        if (!name || !species || !weightKg) {
            return NextResponse.json({ error: "Name, species, and weightKg are required" }, { status: 400 });
        }

        const pet = await prisma.pet.create({
            data: {
                name,
                species,
                breed,
                birthDate: birthDate ? new Date(birthDate) : null,
                deathDate: deathDate ? new Date(deathDate) : null,
                ownerId, // Optional in schema, but passed if linked
                weightKg: parseFloat(weightKg),
                color,
                photoUrl // the Supabase public URL or base64 string
            }
        });

        return NextResponse.json(pet);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error creating pet" }, { status: 500 });
    }
}
