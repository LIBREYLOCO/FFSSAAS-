import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// PATCH /api/users/[id] — actualizar rol, estado o contraseña
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { role, isActive, password, sucursalId } = body;

        const data: Record<string, unknown> = {};
        if (role !== undefined) data.role = role;
        if (isActive !== undefined) data.isActive = isActive;
        if (sucursalId !== undefined) data.sucursalId = sucursalId || null;
        if (password) {
            if (password.length < 8) {
                return NextResponse.json(
                    { error: "La contraseña debe tener al menos 8 caracteres." },
                    { status: 400 }
                );
            }
            data.password = await hashPassword(password);
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, isActive: true, sucursalId: true },
        });

        // If role changed to VENDEDOR → auto-create Salesperson entry
        if (role === "VENDEDOR") {
            await prisma.salesperson.create({
                data: { name: user.name, level: "JUNIOR", commissionRate: 5.0, ...(user.sucursalId && { sucursalId: user.sucursalId }) },
            }).catch(() => { }); // ignore if already exists
        } else if (role === "DRIVER") {
            await prisma.driver.create({
                data: { name: user.name, isActive: true, ...(user.sucursalId && { sucursalId: user.sucursalId }) },
            }).catch(() => { });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("[users/PATCH]", error);
        return NextResponse.json({ error: "Error al actualizar usuario." }, { status: 500 });
    }
}

// DELETE /api/users/[id] — eliminar usuario
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[users/DELETE]", error);
        return NextResponse.json({ error: "Error al eliminar usuario." }, { status: 500 });
    }
}
