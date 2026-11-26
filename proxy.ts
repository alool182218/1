import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { updateHalaqatSession } from "@/app/(halaqat)/apps/halaqat/_lib/session";

export async function proxy(request: NextRequest) {
  // Each project with sign-in keeps its own session cookie.
  if (request.nextUrl.pathname.startsWith("/apps/halaqat")) {
    return updateHalaqatSession(request);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|pwa/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
