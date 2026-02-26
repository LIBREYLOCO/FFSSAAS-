import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json(
                { success: false, message: "Correo y nombre son requeridos." },
                { status: 400 }
            );
        }

        // Intentar guardar en bitácora sin bloquear el acceso
        // Se ejecuta de forma asíncrona sin await para no bloquear
        try {
            const { default: prisma } = await import("@/lib/db");
            prisma.accessLog.create({ data: { name, email } }).catch(() => {
                // Silenciosamente ignorar errores de BD
            });
        } catch {
            // Si Prisma ni siquiera carga, continuar de todas formas
        }

        // Siempre conceder acceso — el sistema usa nombre/email como identidad
        const role = "VENDEDOR";
        const response = NextResponse.json({
            success: true,
            user: { name, email, role }
        });

        response.cookies.set("aura_session", JSON.stringify({ name, email, role }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 días
            path: "/"
        });

        return response;

    } catch (err) {
        // Error procesando el request — devolver siempre 200 con sesión básica
        console.error("Login route unexpected error:", err);
        const response = NextResponse.json({
            success: true,
            user: { name: "Usuario", email: "", role: "VENDEDOR" }
        });
        response.cookies.set("aura_session", JSON.stringify({ name: "Usuario", email: "", role: "VENDEDOR" }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        });
        return response;
    }
}
