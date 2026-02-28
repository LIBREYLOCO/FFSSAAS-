import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        // Update all VeterinaryClinics where referralCommissionRate is 0 or less than 500
        const result = await prisma.veterinaryClinic.updateMany({
            where: {
                referralCommissionRate: {
                    lt: 1 // less than 1 (meaning 0 or missing)
                }
            },
            data: {
                referralCommissionRate: 500
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${result.count} veterinary clinics to have a base rate of 500 MXN.`
        });
    } catch (error: any) {
        console.error("Backfill error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
