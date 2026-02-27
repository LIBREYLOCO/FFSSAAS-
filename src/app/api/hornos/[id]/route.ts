import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN" && role !== "GERENTE_SUCURSAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const { nombre, codigo, capacidadKg, isActive } = await req.json();
    const horno = await prisma.horno.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(codigo && { codigo: codigo.toUpperCase() }),
        ...(capacidadKg !== undefined && { capacidadKg: capacidadKg ? parseFloat(capacidadKg) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json(horno);
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "El código ya existe" }, { status: 409 });
    }
    console.error("PUT /api/hornos/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar horno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN" && role !== "GERENTE_SUCURSAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.horno.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/hornos/[id] error:", error);
    return NextResponse.json({ error: "Error al desactivar horno" }, { status: 500 });
  }
}
