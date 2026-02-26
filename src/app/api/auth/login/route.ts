import { NextResponse } from "next/server";

// Login completamente sin BD - siempre concede acceso
// La BD se usa de forma best-effort, nunca bloquea el acceso
export async function POST(request: Request) {
    let email = "";
    let name = "";

    try {
        const body = await request.json();
        email = body.email || "";
        name = body.name || "";
    } catch {
        // Si no se puede parsear el body, continuar con datos vacíos
    }

    const role = "VENDEDOR";
    const sessionData = JSON.stringify({ name, email, role });

    const response = NextResponse.json({
        success: true,
        user: { name, email, role }
    });

    response.cookies.set("aura_session", sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
    });

    // Intentar registrar en bitácora de forma completamente asíncrona
    // nunca bloquea ni falla el login
    setImmediate(async () => {
        try {
            const { default: prisma } = await import("@/lib/db");
            await prisma.$connect();
            await prisma.accessLog.create({ data: { name, email } }).catch(() => { });
            await prisma.$disconnect();
        } catch {
            // Silencioso - la BD no es requerida para el acceso
        }
    });

    return response;
}
