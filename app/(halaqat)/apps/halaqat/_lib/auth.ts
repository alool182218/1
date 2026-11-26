import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { BASE, createClient } from "./supabase";
import type { Profile } from "./types";

/** The signed-in staff member, or a redirect to the login page. Cached per request. */
export const getStaff = cache(async () => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`${BASE}/login`);

  const { data: profile } = await supabase
    .from("hq_profiles")
    .select("id, full_name, role, phone, active")
    .eq("id", auth.user.id)
    .maybeSingle<Profile>();

  if (!profile || !profile.active) redirect(`${BASE}/login?e=inactive`);

  return { supabase, profile, isAdmin: profile.role === "admin" };
});

export async function requireAdmin() {
  const staff = await getStaff();
  if (!staff.isAdmin) redirect(BASE);
  return staff;
}
