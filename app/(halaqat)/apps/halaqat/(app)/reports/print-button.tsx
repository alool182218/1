"use client";

import { Printer } from "lucide-react";
import { btn } from "../../_components/ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${btn.secondary} no-print`}>
      <Printer size={16} strokeWidth={1.75} aria-hidden />
      طباعة
    </button>
  );
}
