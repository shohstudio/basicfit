import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authSession = request.cookies.get('auth_session');
    const isLoginPage = request.nextUrl.pathname === '/login';

    // Public paths that don't need auth
    const isPublicPath = request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.endsWith('.ico') ||
        request.nextUrl.pathname.endsWith('.png') ||
        request.nextUrl.pathname.endsWith('.svg');

    if (isPublicPath) {
        return NextResponse.next();
    }

    if (!authSession && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (authSession && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
