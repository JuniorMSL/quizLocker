import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAuth = !!token
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/dashboard", req.url))
            }
            return null
        }

        if (!isAuth) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // Role based protection
        if (req.nextUrl.pathname.startsWith("/teacher") && token?.role !== "TEACHER") {
            return NextResponse.redirect(new URL("/student", req.url))
        }

        if (req.nextUrl.pathname.startsWith("/student") && token?.role !== "STUDENT") {
            // Teachers can access student view? Maybe not for now.
            // return NextResponse.redirect(new URL("/teacher", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => true, // Let middleware handle redirection logic
        },
    }
)

export const config = {
    matcher: ["/dashboard/:path*", "/teacher/:path*", "/student/:path*", "/exam/:path*", "/login", "/register"],
}
