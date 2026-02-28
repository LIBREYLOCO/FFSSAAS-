import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all configuration key-values
export async function GET() {
    try {
        const configs = await prisma.systemConfig.findMany();

        // Convert array to an object: { appName: "Aura...", contactPhone: "..." }
        const configObject = configs.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // Return default values directly from the API if they don't exist in DB yet
        const defaultConfigs = {
            appName: "Aura Forever Friends",
            legalName: "Aura Mascotas S.A. de C.V.",
            legalRepresentative: "Roberto Martínez Cruz",
            contactPhone: "55 1234 5678",
            contactWhatsApp: "55 8765 4321",
            primaryColor: "#D4AF37",
            backgroundId: "none",
            ...configObject // DB overrides defaults
        };

        return NextResponse.json(defaultConfigs);
    } catch (error) {
        console.error("Error fetching system config:", error);
        return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
    }
}

// POST updates to configuration key-values
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // body is expected to be an object of key-value pairs
        // e.g. { appName: "New Name", legalName: "New..." }

        const updates = Object.entries(body).map(async ([key, value]) => {
            // Convert any value (boolean, number, etc.) to a string for storage
            const strValue = value !== null && value !== undefined ? String(value) : "";
            return prisma.systemConfig.upsert({
                where: { key: key },
                update: { value: strValue },
                create: { key: key, value: strValue, group: "SYSTEM" }
            });
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true, message: "Configuration updated successfully" });
    } catch (error: any) {
        const msg = error?.message ?? String(error);
        console.error("Error updating system config:", msg);
        return NextResponse.json({ error: "Failed to update configuration", detail: msg }, { status: 500 });
    }
}
