import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const vetId = searchParams.get('vetId');

        // Fetch veterinaries with their completed referrals + service orders + contracts + payments
        const whereClause = vetId ? { id: vetId } : {};

        const veterinaries = await prisma.veterinary.findMany({
            where: whereClause,
            include: {
                referrals: {
                    include: {
                        ServiceOrder: {
                            include: {
                                contract: {
                                    include: {
                                        payments: {
                                            orderBy: { paymentDate: 'desc' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Map and calculate commission data
        const reportData = veterinaries.map(vet => {
            const fixedFee = Number(vet.fixedFee) || 0;
            const validReferrals = vet.referrals.filter(ref => ref.status === 'COMPLETED' || ref.status === 'CONVERTED');

            const referralsDetail = validReferrals.map(ref => {
                const serviceOrder = ref.ServiceOrder;
                const isConverted = ref.status === 'CONVERTED';
                const hasActiveContract = !!serviceOrder?.contract;
                const paidAmount = hasActiveContract
                    ? (serviceOrder.contract!.payments || []).reduce((acc: number, p: any) =>
                        acc + (p.status === 'PAID' ? Number(p.amount) : 0), 0)
                    : 0;

                // Commission logic: if converted to contract, maybe check if paid.
                // Assuming it's a fixed fee for simply referring/converting.
                const commissionEarned = fixedFee;

                return {
                    id: ref.id,
                    petName: ref.petName,
                    ownerName: ref.ownerName,
                    status: ref.status,
                    createdAt: ref.createdAt,
                    commissionEarned,
                    hasActiveContract,
                    paidAmount
                };
            });

            const totalCommission = referralsDetail.reduce((acc, r) => acc + r.commissionEarned, 0);

            return {
                id: vet.id,
                name: vet.name,
                fixedFee,
                totalReferrals: validReferrals.length,
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
