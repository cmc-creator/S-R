"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PrintReportButton() {
  return <button type="button" className="no-print border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold" onClick={() => window.print()}>Print / Save as PDF</button>;
}
export function DeleteReportButton({ kind, id, stayOnPage = false, description }: { kind: "incidents" | "sr-packets"; id: string; stayOnPage?: boolean; description?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (confirmation !== "DELETE" || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/${kind}/${id}`, { method: "DELETE" });
      if (!res.ok) { const body = await res.json(); throw new Error(body.error ?? "Delete failed"); }
      if (stayOnPage) { setConfirming(false); setConfirmation(""); setBusy(false); }
      else router.push(`/dashboard/${kind}`);
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not delete. Try again."); setBusy(false); }
  }
  return <div className="no-print">
    {!confirming ? <button type="button" aria-label={description ? `Delete draft packet: ${description}` : undefined} onClick={() => setConfirming(true)} className="border border-red-300 text-red-700 rounded-lg px-4 py-2 text-sm">Delete {kind === "incidents" ? "report" : "draft packet"}</button> :
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 max-w-sm text-sm" role="group" aria-label="Confirm deletion">
        <p className="font-semibold text-red-900">Permanently delete this {kind === "incidents" ? "report" : "draft packet and its saved sections"}?</p>
        {description && <p className="mt-2 font-semibold">{description}</p>}
        <p className="mt-1">This cannot be undone. Follow facility retention policy. Submitted packets and reviewed or linked incident reports are protected.</p>
        <label className="block mt-2">Type DELETE to confirm<input autoFocus value={confirmation} onChange={e => setConfirmation(e.target.value)} className="block border rounded px-2 py-1 mt-1 w-full" /></label>
        <div className="flex gap-3 mt-3"><button type="button" onClick={remove} disabled={busy || confirmation !== "DELETE"} className="text-red-700 font-semibold disabled:opacity-40">{busy ? "Deleting…" : "Permanently delete"}</button><button type="button" disabled={busy} onClick={() => { setConfirming(false); setConfirmation(""); setError(""); }}>Cancel</button></div>
        {error && <p role="alert" className="text-red-700 mt-2">{error}</p>}
      </div>}
  </div>;
}
