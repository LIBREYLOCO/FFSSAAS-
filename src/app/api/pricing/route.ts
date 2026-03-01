import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEFAULT_RULES = [
    { minKg: 0, maxKg: 5, price: 2500 },
    { minKg: 5, maxKg: 15, price: 3500 },
    { minKg: 15, maxKg: 30, price: 4500 },
    { minKg: 30, maxKg: 9999, price: 6000 },
];

export async function GET(req: NextRequest) {
    try {
        const config = await prisma.systemConfig.findUnique({ where: { key: "weight_price_rules" } });
        const rules = config ? JSON.parse(config.value) : DEFAULT_RULES;

        // Optional: if ?weightKg=XX is passed, return matching price
        const weightKg = req.nextUrl.searchParams.get("weightKg");
        if (weightKg !== null) {
            const w = parseFloat(weightKg);
            const match = rules.find((r: any) => w >= r.minKg && w < r.maxKg);
            return NextResponse.json({ price: match ? match.price : null, rules });
        }

        return NextResponse.json({ rules });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { rules } = await req.json();
        if (!Array.isArray(rules)) {
            return NextResponse.json({ error: "rules must be an array" }, { status: 400 });
        }

        await prisma.systemConfig.upsert({
            where: { key: "weight_price_rules" },
            update: { value: JSON.stringify(rules) },
            create: { key: "weight_price_rules", value: JSON.stringify(rules), group: "PRICING" },
        });

        return NextResponse.json({ success: true, rules });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
