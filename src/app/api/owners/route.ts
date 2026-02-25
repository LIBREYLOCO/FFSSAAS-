import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const owners = await prisma.owner.findMany({
            include: {
                pets: true,
                contracts: {
                    include: { plan: true }
                },
                serviceOrders: true,
                _count: {
                    select: { pets: true, contracts: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(owners);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching owners" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, address, serviceType, petName, petSpecies, petBreed } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Owner
            const owner = await tx.owner.create({
                data: { name, email, phone, address }
            });

            // 2. Handle Service Type logic
            if (serviceType === "IMMEDIATE" && petName) {
                // Create Pet
                const pet = await tx.pet.create({
                    data: {
                        name: petName,
                        species: petSpecies || "Perro",
                        breed: petBreed,
                        ownerId: owner.id
                    }
                });

                // Create Immediate Service Order
                await tx.serviceOrder.create({
                    data: {
                        type: "IMMEDIATE",
                        status: "PENDING",
                        serviceDate: new Date(),
                        price: 3500, // Default price for immediate
                        ownerId: owner.id,
                        petId: pet.id
                    }
                });
            } else if (serviceType === "PREVISION") {
                // Create a basic contract placeholder
                await tx.previsionContract.create({
                    data: {
                        status: "ACTIVE",
                        startDate: new Date(),
                        ownerId: owner.id,
                        planId: "plan-basico", // Default plan
                        downPayment: 1500,
                        installmentAmount: 875
                    }
                });
            }

            return owner;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error creating owner context:", error);
        return NextResponse.json({ error: "Error creating owner", details: error.message }, { status: 500 });
    }
}
