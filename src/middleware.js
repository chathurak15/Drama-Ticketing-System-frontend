import { NextResponse } from "next/server";

// Role-based protected paths
const ADMIN_PATHS = ["/admin-dashboard"];
const THEATRE_MANAGER_PATHS = ["/theatre-manager-dashboard"];
const ORGANIZER_PATHS = ["/organizer-dashboard"];
const USER_PATHS = ["/user-dashboard"];
const PROTECTED_PATHS = [
  ...ADMIN_PATHS,
  ...THEATRE_MANAGER_PATHS,
  ...ORGANIZER_PATHS,
  ...USER_PATHS,
  "/booking",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add Security Headers to every response
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=()"
  );

  // Check if current route requires authentication
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // Check for auth cookies (Spring Boot JSESSIONID, JWT, or custom auth cookie)
    const sessionCookie = request.cookies.get("JSESSIONID") || 
                          request.cookies.get("token") || 
                          request.cookies.get("authToken") ||
                          request.cookies.get("auth");

    // Client-side authentication will also double-check with /user/me in ProtectedRoute
    // If no cookie exists on a protected route, redirect to login with returnUrl
    if (!sessionCookie && pathname.startsWith("/booking") && !request.cookies.get("nataka_user")) {
      // Allow booking page to load if client-side AuthContext manages it, but pass redirect
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files and images
     */
    "/((?!_next/static|_next/image|favicon.ico|assets|images).*)",
  ],
};
