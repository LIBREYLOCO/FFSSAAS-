/**
 * Crea (o actualiza) el usuario ADMIN inicial en la base de datos.
 * Usa SQL directo para compatibilidad con el pooler de Supabase.
 *
 * Uso: npx tsx scripts/seed-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = (process.env.ADMIN_EMAIL ?? "admin@aura.lat").toLowerCase();
const name  = process.env.ADMIN_NAME     ?? "Administrador";
const password = process.env.ADMIN_PASSWORD ?? "AuraAdmin2026!";

async function main() {
    console.log("🔐 Configurando usuario administrador...");

    const hashed = await bcrypt.hash(password, 12);
    const now    = new Date().toISOString();
    const { v4: uuidv4 } = await import("crypto").then(m => ({ v4: () => m.randomUUID() }));
    const newId  = uuidv4();

    // Usar SQL directo (evita el problema de prepared statements del pooler)
    await prisma.$executeRawUnsafe(`
        INSERT INTO "User" (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
        VALUES ('${newId}', '${name.replace(/'/g, "''")}', '${email}', '${hashed}', 'ADMIN', true, '${now}', '${now}')
        ON CONFLICT (email) DO UPDATE
          SET password  = EXCLUDED.password,
              role      = 'ADMIN',
              "isActive" = true,
              "updatedAt" = '${now}'
    `);

    // Leer el usuario creado/actualizado
    const users = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; email: string; role: string }>>(
        `SELECT id, name, email, role FROM "User" WHERE email = '${email}' LIMIT 1`
    );

    const user = users[0];
    console.log("✅ Admin listo:");
    console.log(`   Email     : ${user.email}`);
    console.log(`   Nombre    : ${user.name}`);
    console.log(`   Rol       : ${user.role}`);
    console.log(`   Contraseña: ${password}`);
    console.log("\n⚠️  Cambia la contraseña después del primer login desde Config → Usuarios.");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
