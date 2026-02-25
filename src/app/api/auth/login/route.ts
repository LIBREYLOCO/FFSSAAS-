import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // En producción: Hashear el password y comparar
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password !== password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
        const dbPath = require('path').join(process.cwd(), 'prisma', 'dev.db');
        const fs = require('fs');
        return NextResponse.json({
            error: "Auth error",
            message: error.message,
            dbFileExists: fs.existsSync(dbPath),
            dbPath: dbPath,
            cwd: process.cwd()
        }, { status: 500 });
    }
}
