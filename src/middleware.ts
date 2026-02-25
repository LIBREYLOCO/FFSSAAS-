import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('aura_session');

    // Allow /login and /api/auth/login
    if (request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/api/auth/login') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.includes('.')) {
        return NextResponse.next();
    }

    if (!session) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
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
