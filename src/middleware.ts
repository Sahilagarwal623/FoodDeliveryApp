import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Paths for different roles and public access
    const userProtectedPath = '/restaurants';
    const vendorProtectedPath = '/vendor/dashboard';
    const deliveryProtectedPath = '/delivery/dashboard';
    const authPaths = ['/login', '/register'];

    const isAuthPage = authPaths.some(path => pathname.startsWith(path));
    const isUserProtectedRoute = pathname.startsWith(userProtectedPath);
    const isVendorProtectedRoute = pathname.startsWith(vendorProtectedPath);
    const isDeliveryProtectedRoute = pathname.startsWith(deliveryProtectedPath);


    // --- LOGIC FOR AUTHENTICATED USERS ---
    if (token) {
        if (isAuthPage) {
            const redirectUrl = token.role === 'VENDOR' ? vendorProtectedPath : (token.role === 'DELIVERY') ? deliveryProtectedPath : userProtectedPath;
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        if (token.role === 'USER' && (isVendorProtectedRoute || isDeliveryProtectedRoute)) {
            return NextResponse.redirect(new URL(userProtectedPath, request.url));
        }
        if (token.role === 'VENDOR' && (isUserProtectedRoute || isDeliveryProtectedRoute)) {
            return NextResponse.redirect(new URL(vendorProtectedPath, request.url));
        }
        if (token.role === 'DELIVERY' && (isVendorProtectedRoute || isUserProtectedRoute)) {
            return NextResponse.redirect(new URL(deliveryProtectedPath, request.url));
        }
    }

    // --- LOGIC FOR UNAUTHENTICATED USERS ---
    if (!token) {
        // 4. If a logged-out user tries to access any protected path, redirect them to login
        if (isUserProtectedRoute || isVendorProtectedRoute) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // If none of the above, allow the request to continue
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/login',
        '/register',
        '/vendor/dashboard/:path*',
        '/delivery/dashboard/:path*'
    ]
}