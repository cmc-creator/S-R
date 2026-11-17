"use client";
import { sectionIssues } from "@/lib/reports/sections";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { SRSection, SRField, inp, inpError, btnPrimary, btnSecondary } from "./PhysicianOrderForm";

import { CHECKLIST_ITEMS } from "@/lib/reports/questions";

type ChecklistEntry = { answer: "YES" | "NO" | "NA" | ""; comments: string };
type FormValues = {
  checklist: ChecklistEntry[];
  recommendations: string;
  completedByName: string;
  completedByDate: string;
  reviewedByName: string;
  reviewedByDate: string;
};

interface Props { srPacketId: string; onNext: () => void; onBack: () => void; initialValues?: Record<string, unknown>; }

export default function AfterActionForm({ srPacketId, onNext, onBack, initialValues }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    values: initialValues as FormValues | undefined,
    defaultValues: {
      checklist: CHECKLIST_ITEMS.map(() => ({ answer: "", comments: "" })),
    },
  });

  async function onSubmit(data: FormValues) {
    const issues = sectionIssues("afterActionCritique", data);
    if (issues.length) { setError("Complete before continuing: " + issues.join("; ")); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sr-packets/after-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          srPacketId,
          completedByDate: data.completedByDate ? new Date(data.completedByDate).toISOString() : null,
          reviewedByDate: data.reviewedByDate ? new Date(data.reviewedByDate).toISOString() : null,
        }),
      });
      if (!res.ok) { const problem = await res.json(); throw new Error(problem.error ?? "Could not save. Try again; your entries are still here."); }
      onNext();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <SRSection title="After Action Critique">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2">
          *Completed by House Supervisor or Designee*
        </p>
        <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
          DO NOT FILE IN PATIENT RECORD
        </p>

        {/* Checklist */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border border-gray-200">
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-8">#</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Item</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 whitespace-nowrap">Yes</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 whitespace-nowrap">No</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 whitespace-nowrap">N/A</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Comments</th>
              </tr>
            </thead>
            <tbody>
              {CHECKLIST_ITEMS.map((item, i) => (
                <tr key={item.num} className="border border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{item.num}</td>
                  <td className="px-3 py-2">{item.text}</td>
                  {(["YES", "NO", "NA"] as const).map((opt) => (
                    <td key={opt} className="px-3 py-2 text-center">
                      <input type="radio" value={opt} {...register(`checklist.${i}.answer` as const)} className="accent-blue-700" />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <input {...register(`checklist.${i}.comments` as const)} placeholder="Comments…" className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SRField label="Recommendations for Improvement">
          <textarea {...register("recommendations")} rows={4} className={`${inp} resize-y`} />
        </SRField>

        {/* Signatures */}
        <div className="grid md:grid-cols-2 gap-6 border-t border-gray-100 pt-4">
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Completed By</p>
            <SRField label="Print Name" error={errors.completedByName?.message}><input {...register("completedByName", { required: "Required" })} className={errors.completedByName ? inpError : inp} /></SRField>
            <SRField label="Date" error={errors.completedByDate?.message}><input type="date" {...register("completedByDate", { required: "Required" })} className={errors.completedByDate ? inpError : inp} /></SRField>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Reviewed By QM/Risk Management</p>
            <SRField label="Signature (Print Name)"><input {...register("reviewedByName")} type="text" className={inp} placeholder="Print name for record" /></SRField>
            <SRField label="Date"><input type="date" {...register("reviewedByDate")} className={inp} /></SRField>
          </div>
        </div>
      </SRSection>

      {error && <div role="alert" className="text-red-700 text-sm bg-red-50 border border-red-200 rounded px-4 py-3 whitespace-pre-line">{error}</div>}

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className={btnSecondary}>← Back</button>
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : "Complete Packet ✓"}</button>
      </div>
    </form>
  );
}
