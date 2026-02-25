import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('aura_session');

    // Allow /login, /api/auth/login, and assets
    if (request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/api/auth/login') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.includes('.')) {
        return NextResponse.next();
    }

    if (!session) {
        console.log("No session found, redirecting to /login from:", request.nextUrl.pathname);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth/login (handled manually above)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)',
    ],
};
