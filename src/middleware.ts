import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Usar jose directamente aquí (Edge runtime compatible, sin bcryptjs)
const getSecret = () =>
    new TextEncoder().encode(
        process.env.AUTH_SECRET || "aura-dev-secret-change-in-production"
    );

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas públicas que no requieren sesión
    const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".");

    // APIs públicas específicas (tracking por QR, logout)
    const isPublicApi =
        pathname.startsWith("/api/auth/login") ||
        pathname.startsWith("/api/auth/logout") ||
        pathname.startsWith("/api/tracking");

    if (isPublic || isPublicApi) return NextResponse.next();

    const token = request.cookies.get("aura_session")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, getSecret());

        // Inyectar datos del usuario en headers para que las API routes puedan leerlos
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", payload.id as string);
        requestHeaders.set("x-user-role", payload.role as string);
        requestHeaders.set("x-user-name", payload.name as string);
        requestHeaders.set("x-user-email", payload.email as string);

        return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
        // Token inválido o expirado → limpiar cookie y redirigir a login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("aura_session");
        return response;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
