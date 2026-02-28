import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const vetId = searchParams.get('vetId');

        // Fetch veterinaries with their completed referrals + service orders + contracts + payments
        const whereClause = vetId ? { id: vetId } : {};

        const veterinaries = await prisma.veterinaryClinic.findMany({
            where: whereClause,
            include: {
                serviceOrders: {
                    include: {
                        contract: {
                            include: {
                                payments: {
                                    orderBy: { paymentDate: 'desc' }
                                }
                            }
                        },
                        pet: true,
                        owner: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { businessName: 'asc' }
        });

        // Map and calculate commission data
        const reportData = veterinaries.map((vet) => {
            // No fixedFee on schema, fallback to default 500 for demonstration unless it comes from somewhere else.
            const fixedFee = 500;
            // Use serviceOrders instead of referrals. Only orders with status COMPLETED or similar
            const validOrders = vet.serviceOrders.filter((order) => order.status === 'COMPLETED');

            const referralsDetail = validOrders.map((order) => {
                const hasActiveContract = !!order.contract;
                const paidAmount = hasActiveContract
                    ? (order.contract!.payments || []).reduce((acc: number, p: any) =>
                        acc + (p.status === 'PAID' ? Number(p.amount) : 0), 0)
                    : 0;

                const commissionEarned = fixedFee;

                return {
                    id: order.id,
                    petName: order.pet?.name || 'Mascota',
                    ownerName: order.owner?.name || 'Desconocido',
                    status: order.status,
                    createdAt: order.createdAt,
                    commissionEarned,
                    hasActiveContract,
                    paidAmount
                };
            });

            const totalCommission = referralsDetail.reduce((acc, r) => acc + r.commissionEarned, 0);

            return {
                id: vet.id,
                name: vet.businessName,
                fixedFee,
                totalReferrals: validOrders.length,
                totalCommission,
                referralsDetail
            };
        });

        return NextResponse.json(reportData);
    } catch (error: any) {
        console.error("Error fetching vet commissions:", error);
        return NextResponse.json({ error: "Error de servidor", detail: error.message }, { status: 500 });
    }
}
