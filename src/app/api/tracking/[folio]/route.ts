import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ folio: string }> }
) {
    try {
        const { folio } = await params;

        const order = await prisma.serviceOrder.findFirst({
            where: {
                OR: [
                    { folio: folio },
                    { id: folio },
                    { qrToken: folio }
                ]
            },
            include: {
                pet: true,
                owner: {
                    select: {
                        name: true,
                        source: true
                    }
                },
                trackingLogs: {
                    orderBy: {
                        timestamp: "desc"
                    }
                },
                sesionCremacion: {
                    include: {
                        horno: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Error fetching tracking info:", error);
        return NextResponse.json({ error: "Error al obtener información de seguimiento" }, { status: 500 });
    }
}
