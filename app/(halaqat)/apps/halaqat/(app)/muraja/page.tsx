import type { Metadata } from "next";
import { RecitationView, type Search } from "../hifz/view";

export const metadata: Metadata = { title: "المراجعة" };

export default function MurajaPage({ searchParams }: PageProps<"/apps/halaqat/muraja">) {
  return <RecitationView kind="muraja" searchParams={searchParams as Promise<Search>} />;
}
