import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const body = await request.json();
        const { name, species, breed, birthDate, deathDate, weightKg, color, photoUrl, referralSource, clinicId } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (species !== undefined) updateData.species = species;
        if (breed !== undefined) updateData.breed = breed;
        if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
        if (deathDate !== undefined) updateData.deathDate = deathDate ? new Date(deathDate) : null;
        if (weightKg !== undefined) updateData.weightKg = parseFloat(weightKg as string);
        if (color !== undefined) updateData.color = color;
        if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
        if (referralSource !== undefined) {
            updateData.referralSource = referralSource;
            updateData.clinicId = (referralSource === "VETERINARIA" && clinicId) ? clinicId : null;
        }

        const pet = await prisma.pet.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(pet);
    } catch (error: any) {
        console.error("Prisma error complete:", error);

        // Pass back actual Prisma error text to the frontend 
        const errMessage = error?.message || error?.toString() || "Unknown Prisma schema error";
        return NextResponse.json({ error: errMessage }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        await prisma.pet.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 });
    }
}
