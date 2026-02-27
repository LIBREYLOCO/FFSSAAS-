import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sesion = await prisma.sesionCremacion.findUnique({
      where: { id },
      include: {
        horno: true,
        serviceOrder: {
          include: {
            pet: true,
            owner: true,
          },
        },
      },
    });
    if (!sesion) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    return NextResponse.json(sesion);
  } catch (error) {
    console.error("GET /api/sesiones-cremacion/[id] error:", error);
    return NextResponse.json({ error: "Error al obtener sesión" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { fechaFin, observaciones } = await req.json();
    const sesion = await prisma.sesionCremacion.update({
      where: { id },
      data: {
        ...(fechaFin && { fechaFin: new Date(fechaFin) }),
        ...(observaciones !== undefined && { observaciones }),
      },
    });
    return NextResponse.json(sesion);
  } catch (error) {
    console.error("PATCH /api/sesiones-cremacion/[id] error:", error);
    return NextResponse.json({ error: "Error al actualizar sesión" }, { status: 500 });
  }
}
