import type { Metadata } from "next";
import { RecitationView, type Search } from "./view";

export const metadata: Metadata = { title: "الحفظ" };

export default function HifzPage({ searchParams }: PageProps<"/apps/halaqat/hifz">) {
  return <RecitationView kind="hifz" searchParams={searchParams as Promise<Search>} />;
}
