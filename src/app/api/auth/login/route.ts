import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Correo y contraseña son requeridos." },
                { status: 400 }
            );
        }

        // Buscar usuario en la BD
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Credenciales incorrectas." },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { message: "Tu cuenta está desactivada. Contacta al administrador." },
                { status: 403 }
            );
        }

        // Verificar contraseña con bcrypt
        const passwordOk = await verifyPassword(password, user.password);
        if (!passwordOk) {
            return NextResponse.json(
                { message: "Credenciales incorrectas." },
                { status: 401 }
            );
        }

        // Firmar JWT con los datos del usuario (incluye sucursalId si aplica)
        const token = await signToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            ...(user.sucursalId && { sucursalId: user.sucursalId }),
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id, name: user.name, email: user.email,
                role: user.role, sucursalId: user.sucursalId ?? null,
            },
        });

        response.cookies.set("aura_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 días
            path: "/",
        });

        // Registrar acceso en bitácora (best-effort)
        prisma.accessLog
            .create({ data: { name: user.name, email: user.email } })
            .catch(() => {});

        return response;
    } catch (error) {
        console.error("[auth/login]", error);
        return NextResponse.json(
            { message: "Error interno del servidor." },
            { status: 500 }
        );
    }
}
