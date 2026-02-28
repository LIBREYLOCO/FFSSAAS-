import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ─── GET /api/reportes?tipo=servicios|ingresos|cremaciones|comisiones ─────────
// Filtros comunes: from, to, sucursalId
// Filtros específicos: status, serviceType, hornoId, salespersonId, groupBy

export async function GET(req: NextRequest) {
  const role            = req.headers.get("x-user-role");
  const headerSucursal  = req.headers.get("x-user-sucursal-id");

  const { searchParams } = req.nextUrl;
  const tipo            = searchParams.get("tipo") ?? "servicios";
  const fromStr         = searchParams.get("from");
  const toStr           = searchParams.get("to");
  const sucursalId      = role === "GERENTE_SUCURSAL"
    ? (headerSucursal ?? undefined)
    : (searchParams.get("sucursalId") ?? undefined) || undefined;
  const status          = searchParams.get("status") || undefined;
  const serviceType     = searchParams.get("serviceType") || undefined;
  const hornoId         = searchParams.get("hornoId") || undefined;
  const salespersonId   = searchParams.get("salespersonId") || undefined;

  const from = fromStr ? new Date(fromStr) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to   = toStr   ? new Date(toStr + "T23:59:59") : new Date();

  try {
    switch (tipo) {

      // ── Servicios ────────────────────────────────────────────────────────
      case "servicios": {
        const orders = await prisma.serviceOrder.findMany({
          where: {
            createdAt:  { gte: from, lte: to },
            ...(sucursalId  && { sucursalId }),
            ...(status      && { status }),
            ...(serviceType && { serviceType }),
          },
          include: {
            pet:      { select: { name: true, species: true, breed: true, weightKg: true } },
            owner:    { select: { name: true, phone: true } },
            sucursal: { select: { nombre: true, codigo: true } },
            sesionCremacion: { select: { numeroCertificado: true, fechaInicio: true, fechaFin: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 500,
        });

        const totalRevenue = orders.reduce((s, o) => s + (Number(o.totalCost) || 0), 0);
        const byStatus: Record<string, number> = {};
        const byType:   Record<string, number> = {};
        orders.forEach((o) => {
          byStatus[o.status]      = (byStatus[o.status]      || 0) + 1;
          byType[o.serviceType]   = (byType[o.serviceType]   || 0) + 1;
        });

        return NextResponse.json({ orders, totalRevenue, byStatus, byType, total: orders.length });
      }

      // ── Ingresos ─────────────────────────────────────────────────────────
      case "ingresos": {
        const [orders, payments] = await Promise.all([
          prisma.serviceOrder.findMany({
            where: { createdAt: { gte: from, lte: to }, ...(sucursalId && { sucursalId }) },
            select: { totalCost: true, createdAt: true, serviceType: true, sucursal: { select: { nombre: true, codigo: true } } },
          }),
          prisma.payment.findMany({
            where: {
              paymentDate: { gte: from, lte: to },
              status: "PAID",
              ...(sucursalId && { contract: { owner: { serviceOrders: { some: { sucursalId } } } } }),
            },
            select: { amount: true, paymentDate: true, type: true },
          }),
        ]);

        // Group by month
        const monthMap: Record<string, { servicios: number; prevision: number; total: number }> = {};
        const pad = (n: number) => String(n).padStart(2, "0");

        orders.forEach((o) => {
          const d   = new Date(o.createdAt);
          const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
          if (!monthMap[key]) monthMap[key] = { servicios: 0, prevision: 0, total: 0 };
          const amt = Number(o.totalCost) || 0;
          monthMap[key].total += amt;
          if (o.serviceType === "PREVISION") monthMap[key].prevision += amt;
          else                               monthMap[key].servicios += amt;
        });

        payments.forEach((p) => {
          const d   = new Date(p.paymentDate);
          const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
          if (!monthMap[key]) monthMap[key] = { servicios: 0, prevision: 0, total: 0 };
          monthMap[key].prevision += Number(p.amount) || 0;
          monthMap[key].total     += Number(p.amount) || 0;
        });

        const monthlyData = Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, v]) => ({ month, ...v }));

        const totalServicios = orders.reduce((s, o) => s + (Number(o.totalCost) || 0), 0);
        const totalPrevision = payments.reduce((s, p) => s + (Number(p.amount)   || 0), 0);

        return NextResponse.json({
          monthlyData,
          totalServicios,
          totalPrevision,
          total: totalServicios + totalPrevision,
        });
      }

      // ── Cremaciones ──────────────────────────────────────────────────────
      case "cremaciones": {
        const sesiones = await prisma.sesionCremacion.findMany({
          where: {
            fechaInicio: { gte: from, lte: to },
            ...(hornoId && { hornoId }),
            ...(sucursalId && { horno: { sucursalId } }),
          },
          include: {
            horno: {
              select: {
                nombre: true,
                codigo: true,
                sucursal: { select: { nombre: true, codigo: true } },
              },
            },
            serviceOrder: {
              include: {
                pet:   { select: { name: true, species: true, breed: true, weightKg: true } },
                owner: { select: { name: true } },
              },
            },
          },
          orderBy: { fechaInicio: "desc" },
          take: 500,
        });

        const completadas = sesiones.filter((s) => !!s.fechaFin).length;
        const enCurso     = sesiones.length - completadas;

        // Average duration (completed only)
        const avgMs = sesiones
          .filter((s) => s.fechaFin)
          .reduce((acc, s) => {
            return acc + (new Date(s.fechaFin!).getTime() - new Date(s.fechaInicio).getTime());
          }, 0) / Math.max(completadas, 1);

        const avgMinutes = Math.round(avgMs / 60000);

        // By horno
        const byHorno: Record<string, number> = {};
        sesiones.forEach((s) => {
          const key = s.horno.nombre;
          byHorno[key] = (byHorno[key] || 0) + 1;
        });

        return NextResponse.json({
          sesiones,
          total: sesiones.length,
          completadas,
          enCurso,
          avgMinutes,
          byHorno,
        });
      }

      // ── Comisiones vendedores ────────────────────────────────────────────
      case "comisiones": {
        const vendedores = await prisma.salesperson.findMany({
          where: {
            ...(salespersonId && { id: salespersonId }),
            ...(sucursalId    && { sucursalId }),
          },
          include: {
            sucursal: { select: { nombre: true, codigo: true } },
            contracts: {
              where: {
                startDate: { gte: from, lte: to },
                status: { in: ["ACTIVE", "COMPLETED"] },
              },
              include: {
                plan:     { select: { name: true, price: true } },
                owner:    { select: { name: true } },
                payments: { where: { status: "PAID" }, select: { amount: true } },
              },
            },
          },
        });

        const result = vendedores.map((v) => {
          const totalContracts  = v.contracts.length;
          const totalVenta      = v.contracts.reduce((s, c) => s + (Number(c.plan?.price) || 0), 0);
          const totalCobrado    = v.contracts.reduce((s, c) =>
            s + c.payments.reduce((ps, p) => ps + (Number(p.amount) || 0), 0), 0);
          const comision        = totalVenta * (Number(v.commissionRate) || 0);

          return {
            id:             v.id,
            name:           v.name,
            level:          v.level,
            commissionRate: Number(v.commissionRate),
            sucursal:       v.sucursal,
            totalContracts,
            totalVenta,
            totalCobrado,
            comision,
            contracts:      v.contracts.map((c) => ({
              id:         c.id,
              ownerName:  c.owner?.name,
              planName:   c.plan?.name,
              planPrice:  Number(c.plan?.price) || 0,
              startDate:  c.startDate,
              status:     c.status,
              cobrado:    c.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0),
            })),
          };
        });

        const grandTotal       = result.reduce((s, v) => s + v.totalVenta, 0);
        const grandComision    = result.reduce((s, v) => s + v.comision, 0);

        return NextResponse.json({ vendedores: result, grandTotal, grandComision });
      }

      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 });
    }
  } catch (error) {
    console.error(`GET /api/reportes?tipo=${tipo} error:`, error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
