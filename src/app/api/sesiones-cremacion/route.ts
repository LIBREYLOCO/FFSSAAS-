import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { serviceOrderId, hornoId, operadorNombre, fechaInicio, observaciones } = await req.json();

    if (!serviceOrderId || !hornoId || !operadorNombre || !fechaInicio) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar que la orden no tenga ya una sesión
    const existing = await prisma.sesionCremacion.findUnique({ where: { serviceOrderId } });
    if (existing) {
      return NextResponse.json({ error: "Esta orden ya tiene una sesión de cremación registrada" }, { status: 409 });
    }

    // Generar número de certificado único: CERT-{año}-{secuencial 4 dígitos}
    const year = new Date().getFullYear();
    const countThisYear = await prisma.sesionCremacion.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`) } },
    });
    const sequential = String(countThisYear + 1).padStart(4, "0");
    const numeroCertificado = `CERT-${year}-${sequential}`;

    const sesion = await prisma.sesionCremacion.create({
      data: {
        numeroCertificado,
        hornoId,
        serviceOrderId,
        operadorNombre,
        fechaInicio: new Date(fechaInicio),
        observaciones: observaciones || null,
      },
      include: {
        horno: true,
        serviceOrder: { include: { pet: true, owner: true } },
      },
    });

    // Registrar en bitácora de tracking
    await prisma.trackingLog.create({
      data: {
        serviceOrderId,
        event: `Cremación registrada — Horno: ${sesion.horno.nombre} — Certificado: ${numeroCertificado}`,
        scannedBy: operadorNombre,
      },
    }).catch(() => {});

    return NextResponse.json(sesion, { status: 201 });
  } catch (error) {
    console.error("POST /api/sesiones-cremacion error:", error);
    return NextResponse.json({ error: "Error al crear sesión de cremación" }, { status: 500 });
  }
}
