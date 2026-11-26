import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const BASE = "/apps/halaqat";

/**
 * This project's own auth cookie: a separate name, scoped to the project's path,
 * so its sign-in is independent of the hub and of every other project.
 */
export const COOKIE_OPTIONS = { name: "hq-auth", path: BASE, sameSite: "lax" as const };

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: COOKIE_OPTIONS,
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component; the proxy refreshes the session.
          }
        },
      },
    }
  );
}
