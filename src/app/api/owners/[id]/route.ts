import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const owner = await prisma.owner.findUnique({
            where: { id },
            include: {
                pets: {
                    include: {
                        services: {
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        }
                    }
                },
                contracts: {
                    include: {
                        plan: true,
                        payments: {
                            orderBy: { paymentDate: 'desc' }
                        }
                    }
                },
                serviceOrders: {
                    include: {
                        pet: true,
                        contract: {
                            include: { plan: true }
                        },
                        products: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!owner) {
            return NextResponse.json({ error: "Owner not found" }, { status: 404 });
        }

        return NextResponse.json(owner);
    } catch (error: any) {
        console.error("Error fetching single owner:", error);
        return NextResponse.json({
            error: "Error fetching owner details",
            message: error.message
        }, { status: 500 });
    }
}
