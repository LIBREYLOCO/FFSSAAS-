import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get('aura_session');

    // Permitir todo lo que no requiere sesión
    const isPublic =
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/') ||       // Todas las APIs son libres - cada una gestiona su auth
        pathname.startsWith('/_next') ||
        pathname.includes('.');

    if (isPublic) return NextResponse.next();

    // Si no hay sesión, redirigir a login
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
