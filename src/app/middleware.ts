import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const isLoggedIn = false; // replace later with supabase auth check

    if (!isLoggedIn && req.nextUrl.pathname.startsWith('/notes')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }
}
