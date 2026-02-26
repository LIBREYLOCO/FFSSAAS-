import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // Nota: Debería estar hasheada
                role: role || "VENDEDOR"
            }
        });

        // Crear automáticamente el Vendedor o Chofer si aplica
        if (user.role === "VENDEDOR") {
            await prisma.salesperson.create({
                data: {
                    name: user.name,
                    level: "JUNIOR",
                    commissionRate: 5.0
                }
            });
        } else if (user.role === "DRIVER") {
            await prisma.driver.create({
                data: {
                    name: user.name,
                    isActive: true
                }
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Error creating user" }, { status: 500 });
    }
}
