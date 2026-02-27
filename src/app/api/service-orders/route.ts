import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
    const sucursalId = request.headers.get("x-user-sucursal-id") ?? undefined;

    try {
        const body = await request.json();
        const { ownerId, petId, serviceType, contractId, price, serviceDate, selectedProducts } = body;

        // Validation (ownerId is now optional, but for now we likely still need it or a clinicId)
        if (!petId || !serviceType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Calculate totals
        const basePrice = price || 0;
        let productsTotal = 0;
        if (selectedProducts && Array.isArray(selectedProducts)) {
            productsTotal = selectedProducts.reduce((sum: number, p: any) => sum + (p.price * (p.quantity || 1)), 0);
        }
        const totalCost = basePrice + productsTotal;

        // Generators
        const folio = `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const qrToken = `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const newOrder = await prisma.$transaction(async (tx) => {
            // 1. Create the Service Order
            const order = await tx.serviceOrder.create({
                data: {
                    folio,
                    ownerId, // Optional now
                    petId,
                    serviceType, // Renamed from type
                    contractId,
                    qrToken,
                    totalCost: totalCost, // Decimal
                    balanceDue: totalCost, // Decimal (Assuming full amount pending)
                    status: "PENDING_PICKUP", // Default enum
                    createdAt: serviceDate ? new Date(serviceDate) : new Date(),
                    ...(sucursalId && { sucursalId }),
                }
            });

            // 2. Mark the pet as deceased (Set deathDate)
            await tx.pet.update({
                where: { id: petId },
                data: {
                    deathDate: serviceDate ? new Date(serviceDate) : new Date()
                }
            });

            // 3. If there are products, link them and deduct stock
            if (selectedProducts && Array.isArray(selectedProducts)) {
                for (const item of selectedProducts) {
                    await tx.serviceOrderProduct.create({
                        data: {
                            serviceOrderId: order.id,
                            productId: item.id,
                            quantity: item.quantity || 1,
                            priceAtTime: item.price
                        }
                    });

                    await tx.product.update({
                        where: { id: item.id },
                        data: {
                            stock: {
                                decrement: item.quantity || 1
                            }
                        }
                    });
                }
            }

            return tx.serviceOrder.findUnique({
                where: { id: order.id },
                include: {
                    pet: true,
                    contract: { include: { plan: true } },
                    products: { include: { product: true } }
                }
            });
        });

        return NextResponse.json(newOrder);
    } catch (error: any) {
        console.error("Error creating service order:", error);
        return NextResponse.json({ error: error.message || "Error creating service order" }, { status: 500 });
    }
}
