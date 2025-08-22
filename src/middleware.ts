import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// export { default } from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = await getToken({req: request, secret: process.env.AUTH_SECRET});
    const url = request.nextUrl;

    if (token && (
        (url.pathname.startsWith('/login')) ||
        (url.pathname.startsWith('/register')) ||
        (url.pathname.startsWith('/'))
    )) {
        return NextResponse.redirect(new URL('/restaurants', request.url))
    }


    console.log(request.url);
    
    return NextResponse.redirect(new URL('/', request.url))
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/login',
    '/register',
  ]
}