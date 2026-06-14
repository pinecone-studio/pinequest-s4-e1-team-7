import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = [
  "/",
  "/auth",
  "/call",
  "/welcome",
  "/models",
  "/mediapipe-wasm",
  "/tfjs-wasm",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get("sb_token")?.value;
  if (!token && (pathname.startsWith("/dashboard") || pathname.startsWith("/accessible"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    if (pathname.startsWith("/accessible")) {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|wasm|task|bin)).*)",
  ],
};
