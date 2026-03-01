import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const roleFilter = url.searchParams.get("role");
        const users = await prisma.user.findMany({
            where: roleFilter ? { role: roleFilter } : undefined,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                sucursalId: true,
                sucursal: { select: { nombre: true, codigo: true } },
            },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(users);
    } catch {
        return NextResponse.json({ error: "Error al obtener usuarios." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, sucursalId } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Nombre, correo y contraseña son requeridos." }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existing) {
            return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
        }

        const hashed = await hashPassword(password);
        const assignedRole = role || "VENDEDOR";

        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase().trim(),
                password: hashed,
                role: assignedRole,
                isActive: true,
                ...(sucursalId && { sucursalId }),
            },
            select: {
                id: true, name: true, email: true, role: true,
                isActive: true, createdAt: true, sucursalId: true,
                sucursal: { select: { nombre: true, codigo: true } },
            },
        });

        // Crear automáticamente el perfil Vendedor o Chofer si aplica
        if (assignedRole === "VENDEDOR") {
            await prisma.salesperson.create({
                data: { name: user.name, level: "JUNIOR", commissionRate: 5.0, ...(sucursalId && { sucursalId }) },
            }).catch(() => {}); // no bloquear si ya existe
        } else if (assignedRole === "DRIVER") {
            await prisma.driver.create({
                data: { name: user.name, isActive: true, ...(sucursalId && { sucursalId }) },
            }).catch(() => {});
        }

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("[users/POST]", error);
        return NextResponse.json({ error: "Error al crear usuario." }, { status: 500 });
    }
}
