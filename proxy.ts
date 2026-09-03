import { NextResponse, NextRequest } from "next/server";



export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // checking for session cookie 
    const sessionCookie =
        request.cookies.get("next-auth.session-token") ?? request.cookies.get("__Secure_next-auth.session-token");

    // const isAuthed = !!(sessionCookie?.value);
    // const isAuthRoute = pathname === '/login' || pathname === '/register';
    // const isChatRoute =  pathname.startsWith('/rooms');

    // // Unauthenticated user trying to reach a protected chat route
    // if (isChatRoute && !isAuthed) {
    //     return NextResponse.redirect(new URL("/login", request.url));
    // }

    // // Authenticated user trying to reach login or register
    // if (isAuthRoute && isAuthed) {
    //     return NextResponse.redirect(new URL("/rooms", request.url));
    // }

}

export const config = {
    matcher: ["/rooms/:path*", "/login", "/register"],
}