import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sucursales = await prisma.sucursal.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: {
            users: true,
            drivers: true,
            serviceOrders: { where: { status: { notIn: ["COMPLETED"] } } },
          },
        },
      },
    });
    return NextResponse.json(sucursales);
  } catch (error) {
    console.error("GET /api/sucursales error:", error);
    return NextResponse.json({ error: "Error al obtener sucursales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { nombre, codigo, direccion, ciudad, estado, telefono, email, latitude, longitude } = body;

    if (!nombre || !codigo) {
      return NextResponse.json({ error: "Nombre y código son requeridos" }, { status: 400 });
    }

    const sucursal = await prisma.sucursal.create({
      data: {
        nombre,
        codigo: codigo.toUpperCase(),
        direccion,
        ciudad,
        estado,
        telefono,
        email,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    return NextResponse.json(sucursal, { status: 201 });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "El código de sucursal ya existe" }, { status: 409 });
    }
    console.error("POST /api/sucursales error:", error);
    return NextResponse.json({ error: "Error al crear sucursal" }, { status: 500 });
  }
}
