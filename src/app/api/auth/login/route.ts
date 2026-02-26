import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    const { email, name } = await (request.json());

    // Intentar registrar acceso en bitácora (no bloquea el acceso si falla)
    try {
        await prisma.accessLog.create({ data: { name, email } });
    } catch (dbErr) {
        console.warn("AccessLog write failed (non-critical):", dbErr);
    }

    // Determinar nombre de usuario para la sesión
    let userName = name;
    let userRole = "VENDEDOR";

    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: { name, email, password: "SYSTEM_MANAGED", role: "VENDEDOR" }
            });
        }
        userName = user.name;
        userRole = user.role;
    } catch (dbErr) {
        console.warn("User lookup/create failed (non-critical):", dbErr);
    }

    // Siempre conceder acceso con nombre y correo proporcionados
    const response = NextResponse.json({ success: true, user: { name: userName, role: userRole } });
    response.cookies.set("aura_session", JSON.stringify({ email, role: userRole }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7
    });

    return response;
}
