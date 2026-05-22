"use client";
import { useEffect } from "react";

export default function PrintButton({ autoprint = false }: { autoprint?: boolean }) {
  useEffect(() => {
    if (autoprint) {
      // Small delay so the page renders fully before the dialog opens
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [autoprint]);

  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-sm transition flex items-center gap-2"
    >
      🖨 Print / Save as PDF
    </button>
  );
}
