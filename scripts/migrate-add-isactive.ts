/**
 * Agrega la columna isActive a la tabla User si no existe.
 * Usa la misma conexión que la app (DATABASE_URL).
 *
 * Uso: npx tsx scripts/migrate-add-isactive.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Aplicando migración: ADD COLUMN isActive...");

    await prisma.$executeRaw`
        ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true
    `;

    console.log("✅ Columna isActive agregada (o ya existía).");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
