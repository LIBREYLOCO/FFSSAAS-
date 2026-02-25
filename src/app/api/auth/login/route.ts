import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        // 1. Registrar el acceso en la bitácora
        await prisma.accessLog.create({
            data: { name, email }
        });

        // 2. Buscar o crear el usuario para la sesión
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: "SYSTEM_MANAGED", // Placeholder ya que no se usará
                    role: "VENDEDOR"
                }
            });
        }


        const response = NextResponse.json({ success: true, user: { name: user.name, role: user.role } });

        // Set a simple session cookie (In production use JWT)
        response.cookies.set("aura_session", JSON.stringify({ id: user.id, role: user.role }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return response;
    } catch (error: any) {
        console.error("Auth error details:", error);
        return NextResponse.json({
            error: "Auth error",
            message: error.message,
            stack: error.stack,
            db_url_set: !!process.env.DATABASE_URL
        }, { status: 500 });
    }
}
