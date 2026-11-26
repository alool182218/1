import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { BASE, COOKIE_OPTIONS } from "./supabase";

const PUBLIC_PATHS = [`${BASE}/login`];

/** Runs in the proxy for every request under /apps/halaqat. */
export async function updateHalaqatSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: COOKIE_OPTIONS,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!signedIn && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = `${BASE}/login`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
