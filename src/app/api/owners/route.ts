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
        const {
            name, email, phone, address, serviceType, petName, petSpecies, petBreed,
            // Structured address fields
            streetName, streetNumber, interiorNum, neighborhood,
            city, state, country, zipCode,
            latitude, longitude,
        } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Owner
            const owner = await tx.owner.create({
                data: {
                    name, email, phone, address,
                    streetName, streetNumber, interiorNum, neighborhood,
                    city, state, country, zipCode,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                }
            });

            // 2. Handle Service Type logic
            if (serviceType === "IMMEDIATE" && petName) {
                // Create Pet
                const pet = await tx.pet.create({
                    data: {
                        name: petName,
                        species: petSpecies || "Perro",
                        breed: petBreed,
                        weightKg: 0,
                        ownerId: owner.id
                    }
                });

                // Create Immediate Service Order
                const timestamp = Date.now();
                await tx.serviceOrder.create({
                    data: {
                        folio: `SRV-${timestamp}`,
                        serviceType: "IMMEDIATE",
                        status: "PENDING_PICKUP",
                        totalCost: 3500,
                        balanceDue: 3500,
                        ownerId: owner.id,
                        petId: pet.id,
                        qrToken: `QR-${timestamp}`
                    }
                });
            } else if (serviceType === "PREVISION") {
                // Ensure default plan exists
                const planId = "plan-basico";
                await tx.previsionPlan.upsert({
                    where: { id: planId },
                    update: {},
                    create: {
                        id: planId,
                        name: "Plan Básico de Previsión",
                        price: 10500,
                        installmentsCount: 12
                    }
                });

                // Create a basic contract placeholder
                await tx.previsionContract.create({
                    data: {
                        status: "ACTIVE",
                        startDate: new Date(),
                        ownerId: owner.id,
                        planId: planId,
                        downPayment: 1500,
                        installmentAmount: 875
                    }
                });
            }

            return owner.id;
        });

        // 3. Fetch the fully populated owner to return to the frontend
        const newOwner = await prisma.owner.findUnique({
            where: { id: result },
            include: {
                pets: true,
                contracts: { include: { plan: true } },
                serviceOrders: true,
                _count: { select: { pets: true, contracts: true } }
            }
        });

        return NextResponse.json(newOwner);
    } catch (error: any) {
        console.error("Error creating owner context:", error);
        return NextResponse.json({ error: "Error creating owner", details: error.message }, { status: 500 });
    }
}
