import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sucursal = await prisma.sucursal.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, serviceOrders: true, drivers: true },
        },
      },
    });
    if (!sucursal) return NextResponse.json({ error: "Sucursal no encontrada" }, { status: 404 });
    return NextResponse.json(sucursal);
  } catch (error) {
    console.error("GET /api/sucursales/[id] error:", error);
    return NextResponse.json({ error: "Error al obtener sucursal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { nombre, codigo, direccion, ciudad, estado, telefono, email, latitude, longitude, isActive } = body;

    const sucursal = await prisma.sucursal.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(codigo && { codigo: codigo.toUpperCase() }),
        ...(direccion !== undefined && { direccion }),
        ...(ciudad !== undefined && { ciudad }),
        ...(estado !== undefined && { estado }),
        ...(telefono !== undefined && { telefono }),
        ...(email !== undefined && { email }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(sucursal);
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "El código de sucursal ya existe" }, { status: 409 });
    }
    console.error("PUT /api/sucursales/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar sucursal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  try {
    // Soft-delete: desactivar en lugar de borrar
    await prisma.sucursal.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/sucursales/[id] error:", error);
    return NextResponse.json({ error: "Error al desactivar sucursal" }, { status: 500 });
  }
}
