import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/security/logs?limit=50&page=1
export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const page  = Math.max(parseInt(searchParams.get("page")  ?? "1"), 1);
  const skip  = (page - 1) * limit;

  try {
    const [logs, total] = await Promise.all([
      prisma.accessLog.findMany({
        orderBy: { timestamp: "desc" },
        take:  limit,
        skip,
      }),
      prisma.accessLog.count(),
    ]);

    // Summary stats
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week  = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayCount, weekCount, uniqueUsers] = await Promise.all([
      prisma.accessLog.count({ where: { timestamp: { gte: today } } }),
      prisma.accessLog.count({ where: { timestamp: { gte: week  } } }),
      prisma.accessLog.groupBy({ by: ["email"], _count: { email: true } }),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        today:       todayCount,
        thisWeek:    weekCount,
        uniqueUsers: uniqueUsers.length,
      },
    });
  } catch (error) {
    console.error("GET /api/security/logs error:", error);
    return NextResponse.json({ error: "Error al obtener logs" }, { status: 500 });
  }
}

// DELETE /api/security/logs  →  purge logs older than N days
export async function DELETE(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { days = 90 } = await req.json().catch(() => ({}));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const { count } = await prisma.accessLog.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });
    return NextResponse.json({ deleted: count });
  } catch (error) {
    console.error("DELETE /api/security/logs error:", error);
    return NextResponse.json({ error: "Error al limpiar logs" }, { status: 500 });
  }
}
