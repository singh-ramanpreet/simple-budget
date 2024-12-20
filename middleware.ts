import { betterFetch } from "@better-fetch/fetch"
import type { Session } from "better-auth/types"
import { NextResponse, type NextRequest } from "next/server"

const protectedRoutes = ["/"]
const loginRoutes = ["/sign-in", "/sign-up"]

export default async function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isLoginRoute = loginRoutes.includes(request.nextUrl.pathname)

  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const baseURL = `${forwardedProto}://${forwardedHost}`

  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: baseURL,
    headers: {
      //get the cookie from the request
      cookie: request.headers.get("cookie") || "",
    },
  })

  if (!session) {
    if (isProtectedRoute && !isLoginRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  } else {
    if (isLoginRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  return NextResponse.next()
}

// Configuration object for the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
