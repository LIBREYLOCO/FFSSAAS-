import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCremationCertificate } from "@/lib/pdfGenerator";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sesion = await prisma.sesionCremacion.findUnique({
      where: { id },
      include: {
        horno: true,
        serviceOrder: {
          include: { pet: true, owner: true },
        },
      },
    });

    if (!sesion) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    // Obtener nombre de la empresa desde configuración (best-effort)
    const [nombreConfig, reprConfig] = await Promise.all([
      prisma.systemConfig.findUnique({ where: { key: "appName" } }),
      prisma.systemConfig.findUnique({ where: { key: "legalRepresentative" } }),
    ]).catch(() => [null, null]) as [{ value: string } | null, { value: string } | null];

    const pdfBuffer = await generateCremationCertificate({
      sesion: {
        numeroCertificado: sesion.numeroCertificado,
        operadorNombre: sesion.operadorNombre,
        fechaInicio: sesion.fechaInicio.toISOString(),
        fechaFin: sesion.fechaFin?.toISOString() ?? null,
        observaciones: sesion.observaciones ?? null,
      },
      horno: {
        nombre: sesion.horno.nombre,
        codigo: sesion.horno.codigo,
      },
      pet: {
        name: sesion.serviceOrder.pet.name,
        species: sesion.serviceOrder.pet.species,
        breed: sesion.serviceOrder.pet.breed ?? null,
        weightKg: Number(sesion.serviceOrder.pet.weightKg),
        deathDate: sesion.serviceOrder.pet.deathDate?.toISOString() ?? null,
      },
      owner: {
        name: sesion.serviceOrder.owner?.name ?? "Propietario",
        phone: sesion.serviceOrder.owner?.phone ?? null,
      },
      serviceOrder: {
        folio: sesion.serviceOrder.folio,
      },
      empresa: {
        nombre: nombreConfig?.value ?? "Aura Forever Friends",
        legalRepresentative: reprConfig?.value,
      },
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sesion.numeroCertificado}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/sesiones-cremacion/[id]/certificado error:", error);
    return NextResponse.json({ error: "Error al generar certificado" }, { status: 500 });
  }
}
