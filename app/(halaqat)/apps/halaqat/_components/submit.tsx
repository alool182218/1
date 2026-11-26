"use client";

import { useFormStatus } from "react-dom";
import { Loader } from "lucide-react";

/** Submit button that shows a spinner while its form's action runs. */
export function Submit({ className, children }: { className: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader size={15} strokeWidth={1.75} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
