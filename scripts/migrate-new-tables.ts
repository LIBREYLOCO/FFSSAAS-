/**
 * Crea las tablas nuevas en Supabase: Sucursal, Horno, SesionCremacion
 * y agrega columnas sucursalId a tablas existentes.
 *
 * Usa $executeRawUnsafe para evitar el error "prepared statement already exists"
 * de PgBouncer en modo transaction.
 *
 * Uso: npx tsx scripts/migrate-new-tables.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run(sql: string, label: string) {
    try {
        await prisma.$executeRawUnsafe(sql);
        console.log(`✅ ${label}`);
    } catch (e: any) {
        // Prisma wraps PG errors: check both e.code and e.meta.code
        const pgCode: string = e.meta?.code ?? e.code ?? "";
        // 42P07 = relation already exists
        // 42710 = constraint already exists
        // 42701 = column already exists
        if (["42P07", "42710", "42701"].includes(pgCode)) {
            console.log(`⏭  ${label} (ya existe)`);
        } else {
            console.error(`❌ ${label}: ${e.message}`);
        }
    }
}

async function main() {
    console.log("🔧 Aplicando migraciones de tablas nuevas...\n");

    // ── Sucursal ──────────────────────────────────────────────────────────
    await run(`
        CREATE TABLE IF NOT EXISTS "Sucursal" (
            "id"          TEXT NOT NULL,
            "nombre"      TEXT NOT NULL,
            "codigo"      TEXT NOT NULL,
            "direccion"   TEXT,
            "ciudad"      TEXT,
            "estado"      TEXT,
            "telefono"    TEXT,
            "email"       TEXT,
            "latitude"    DOUBLE PRECISION,
            "longitude"   DOUBLE PRECISION,
            "isActive"    BOOLEAN NOT NULL DEFAULT true,
            "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
        )
    `, "CREATE TABLE Sucursal");

    await run(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Sucursal_codigo_key" ON "Sucursal"("codigo")`,
        "UNIQUE INDEX Sucursal.codigo"
    );

    // ── Horno ─────────────────────────────────────────────────────────────
    await run(`
        CREATE TABLE IF NOT EXISTS "Horno" (
            "id"          TEXT NOT NULL,
            "nombre"      TEXT NOT NULL,
            "codigo"      TEXT NOT NULL,
            "capacidadKg" DOUBLE PRECISION,
            "sucursalId"  TEXT,
            "isActive"    BOOLEAN NOT NULL DEFAULT true,
            "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Horno_pkey" PRIMARY KEY ("id")
        )
    `, "CREATE TABLE Horno");

    await run(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Horno_codigo_key" ON "Horno"("codigo")`,
        "UNIQUE INDEX Horno.codigo"
    );

    await run(`
        ALTER TABLE "Horno" ADD CONSTRAINT "Horno_sucursalId_fkey"
        FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK Horno -> Sucursal");

    // ── SesionCremacion ───────────────────────────────────────────────────
    await run(`
        CREATE TABLE IF NOT EXISTS "SesionCremacion" (
            "id"                TEXT NOT NULL,
            "numeroCertificado" TEXT NOT NULL,
            "hornoId"           TEXT NOT NULL,
            "serviceOrderId"    TEXT NOT NULL,
            "operadorNombre"    TEXT NOT NULL,
            "fechaInicio"       TIMESTAMP(3) NOT NULL,
            "fechaFin"          TIMESTAMP(3),
            "observaciones"     TEXT,
            "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "SesionCremacion_pkey" PRIMARY KEY ("id")
        )
    `, "CREATE TABLE SesionCremacion");

    await run(
        `CREATE UNIQUE INDEX IF NOT EXISTS "SesionCremacion_numeroCertificado_key" ON "SesionCremacion"("numeroCertificado")`,
        "UNIQUE INDEX SesionCremacion.numeroCertificado"
    );

    await run(
        `CREATE UNIQUE INDEX IF NOT EXISTS "SesionCremacion_serviceOrderId_key" ON "SesionCremacion"("serviceOrderId")`,
        "UNIQUE INDEX SesionCremacion.serviceOrderId"
    );

    await run(`
        ALTER TABLE "SesionCremacion" ADD CONSTRAINT "SesionCremacion_hornoId_fkey"
        FOREIGN KEY ("hornoId") REFERENCES "Horno"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `, "FK SesionCremacion -> Horno");

    await run(`
        ALTER TABLE "SesionCremacion" ADD CONSTRAINT "SesionCremacion_serviceOrderId_fkey"
        FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `, "FK SesionCremacion -> ServiceOrder");

    // ── Columnas nuevas en tablas existentes ──────────────────────────────
    console.log("\n🔧 Agregando columnas sucursalId...\n");

    await run(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sucursalId" TEXT`, "COLUMN User.sucursalId");
    await run(`ALTER TABLE "Driver" ADD COLUMN IF NOT EXISTS "sucursalId" TEXT`, "COLUMN Driver.sucursalId");
    await run(`ALTER TABLE "Route" ADD COLUMN IF NOT EXISTS "sucursalId" TEXT`, "COLUMN Route.sucursalId");
    await run(`ALTER TABLE "ServiceOrder" ADD COLUMN IF NOT EXISTS "sucursalId" TEXT`, "COLUMN ServiceOrder.sucursalId");
    await run(`ALTER TABLE "ServiceOrder" ADD COLUMN IF NOT EXISTS "routeId" TEXT`, "COLUMN ServiceOrder.routeId");
    await run(`ALTER TABLE "Salesperson" ADD COLUMN IF NOT EXISTS "sucursalId" TEXT`, "COLUMN Salesperson.sucursalId");
    await run(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sucursalId" TEXT`, "COLUMN Product.sucursalId");

    // ── FK hacia Sucursal en tablas existentes ────────────────────────────
    console.log("\n🔧 Agregando foreign keys...\n");

    await run(`
        ALTER TABLE "User" ADD CONSTRAINT "User_sucursalId_fkey"
        FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK User -> Sucursal");

    await run(`
        ALTER TABLE "Driver" ADD CONSTRAINT "Driver_sucursalId_fkey"
        FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK Driver -> Sucursal");

    await run(`
        ALTER TABLE "Route" ADD CONSTRAINT "Route_sucursalId_fkey"
        FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK Route -> Sucursal");

    await run(`
        ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_sucursalId_fkey"
        FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK ServiceOrder -> Sucursal");

    await run(`
        ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_routeId_fkey"
        FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK ServiceOrder -> Route");

    await run(`
        ALTER TABLE "Salesperson" ADD CONSTRAINT "Salesperson_sucursalId_fkey"
        FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK Salesperson -> Sucursal");

    await run(`
        ALTER TABLE "Product" ADD CONSTRAINT "Product_sucursalId_fkey"
        FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `, "FK Product -> Sucursal");

    console.log("\n🎉 Migración completada.");
}

main()
    .catch((e) => {
        console.error("❌ Error fatal:", e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
