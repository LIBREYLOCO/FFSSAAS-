/**
 * Crea (o actualiza) el usuario ADMIN inicial en la base de datos.
 *
 * Uso:
 *   npx tsx scripts/seed-admin.ts
 *
 * Variables de entorno opcionales:
 *   ADMIN_EMAIL    → default: admin@aura.lat
 *   ADMIN_NAME     → default: Administrador
 *   ADMIN_PASSWORD → default: AuraAdmin2026!
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL ?? "admin@aura.lat";
const name = process.env.ADMIN_NAME ?? "Administrador";
const password = process.env.ADMIN_PASSWORD ?? "AuraAdmin2026!";

async function main() {
    console.log("🔐 Configurando usuario administrador...");

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashed,
            role: "ADMIN",
            isActive: true,
        },
        create: {
            name,
            email,
            password: hashed,
            role: "ADMIN",
            isActive: true,
        },
    });

    console.log("✅ Admin listo:");
    console.log(`   Email    : ${user.email}`);
    console.log(`   Nombre   : ${user.name}`);
    console.log(`   Rol      : ${user.role}`);
    console.log(`   Contraseña: ${password}`);
    console.log("\n⚠️  Cambia la contraseña después del primer login.");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
