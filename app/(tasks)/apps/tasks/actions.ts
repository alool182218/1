"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { createClient } from "@/utils/supabase/server";

async function db() {
  return createClient(await cookies());
}

export async function addTask(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 300);
  if (!name) return;
  const { error } = await (await db()).from("todos").insert({ name });
  if (error) throw new Error(error.message);
  refresh();
}

export async function toggleTask(id: number, done: boolean) {
  const { error } = await (await db()).from("todos").update({ done }).eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteTask(id: number) {
  const { error } = await (await db()).from("todos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}
