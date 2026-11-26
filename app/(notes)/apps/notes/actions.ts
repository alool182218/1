"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { createClient } from "@/utils/supabase/server";

async function db() {
  return createClient(await cookies());
}

export async function addNote(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim().slice(0, 2000);
  if (!text) return;
  const { error } = await (await db()).from("notes").insert({ text });
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteNote(id: number) {
  const { error } = await (await db()).from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}
