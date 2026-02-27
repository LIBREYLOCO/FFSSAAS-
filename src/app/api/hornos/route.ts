import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  const headerSucursalId = req.headers.get("x-user-sucursal-id");
  const queryParam = req.nextUrl.searchParams.get("sucursalId");

  const sucursalId = role === "GERENTE_SUCURSAL"
    ? (headerSucursalId ?? undefined)
    : (queryParam ?? undefined);

  try {
    const hornos = await prisma.horno.findMany({
      where: {
        isActive: true,
        ...(sucursalId && { sucursalId }),
      },
      include: {
        sucursal: { select: { nombre: true, codigo: true } },
        _count: { select: { sesiones: true } },
      },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(hornos);
  } catch (error) {
    console.error("GET /api/hornos error:", error);
    return NextResponse.json({ error: "Error al obtener hornos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN" && role !== "GERENTE_SUCURSAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const sucursalId = req.headers.get("x-user-sucursal-id") ?? undefined;

  try {
    const { nombre, codigo, capacidadKg, sucursalId: bodySucursalId } = await req.json();
    if (!nombre || !codigo) {
      return NextResponse.json({ error: "Nombre y código son requeridos" }, { status: 400 });
    }

    const horno = await prisma.horno.create({
      data: {
        nombre,
        codigo: codigo.toUpperCase(),
        capacidadKg: capacidadKg ? parseFloat(capacidadKg) : null,
        sucursalId: bodySucursalId || sucursalId || null,
      },
    });
    return NextResponse.json(horno, { status: 201 });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "El código de horno ya existe" }, { status: 409 });
    }
    console.error("POST /api/hornos error:", error);
    return NextResponse.json({ error: "Error al crear horno" }, { status: 500 });
  }
}
