"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { sectionKeys, sectionIssues, toFormSection } from "@/lib/reports/sections";
import PacketWorkspace from "@/components/sr/PacketWorkspace";
import PatientSelector from "@/components/PatientSelector";
import PhysicianOrderForm from "@/components/sr/PhysicianOrderForm";
import FaceToFaceForm from "@/components/sr/FaceToFaceForm";
import MonitoringLogForm from "@/components/sr/MonitoringLogForm";
import TerminationForm from "@/components/sr/TerminationForm";
import PatientDebriefingForm from "@/components/sr/PatientDebriefingForm";
import StaffDebriefingForm from "@/components/sr/StaffDebriefingForm";
import AfterActionForm from "@/components/sr/AfterActionForm";


function NewSRPacketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [packetId, setPacketId] = useState<string | null>(searchParams.get("packetId"));
  const [initial, setInitial] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState(!!searchParams.get("packetId"));
  const [loadFailed, setLoadFailed] = useState(false);
  const [visited, setVisited] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [dirty, setDirty] = useState<number[]>([]);

  const [patientId, setPatientId] = useState(searchParams.get("patientId") ?? "");
  const incidentId = searchParams.get("incidentId");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [patientLabel, setPatientLabel] = useState("");

  useEffect(() => {
    const id = searchParams.get("packetId");
    if (!id) return;
    let active = true;
    fetch(`/api/sr-packets/${id}`).then(async res => {
      if (!res.ok) throw new Error("Could not reopen this packet. Return to the packet and try again.");
      const packet = await res.json();
      if (!active) return;
      if (packet.submittedAt) { router.replace(`/dashboard/sr-packets/${id}`); return; }
      const values: Record<string, Record<string, unknown>> = {};
      const done: number[] = [];
      sectionKeys.forEach((key, i) => {
        const record = key === "monitoringLogs" ? packet[key][0] : packet[key];
        if (record) {
          values[key] = toFormSection(key, record);
          if (!sectionIssues(key, values[key]).length) done.push(i + 1);
        }
      });
      const firstMissing = sectionKeys.findIndex((_, i) => !done.includes(i + 1));
      const resume = firstMissing < 0 ? 7 : firstMissing + 1;
      setInitial(values); setCompleted(done); setVisited([resume]);
      setPatientLabel(`${packet.patient.fullName} · MRN ${packet.patient.mrn}`);
      setPatientId(packet.patientId); setStep(resume); setMaxStep(resume); setLoading(false);
    }).catch(err => { if (active) { setError(err.message); setLoadFailed(true); setLoading(false); } });
    return () => { active = false; };
  }, [searchParams, router]);


  async function createPacket() {
    if (!patientId) { setError("Please select a patient."); return; }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/sr-packets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, incidentReportId: incidentId ?? null }),
      });
      if (!res.ok) { const body = await res.json(); throw new Error(body.error ?? "Failed to create packet."); }
      const packet = await res.json();
      // Put the durable packet ID in the URL so reload never starts another packet.
      setLoading(true);
      router.replace(`/dashboard/sr-packets/new?packetId=${packet.id}`);
      setPacketId(packet.id); setStep(1); setMaxStep(1); setVisited([1]);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create packet. Try again."); }
    finally { setCreating(false); }
  }

  function next() {
    const nextStep = Math.min(step + 1, 7);
    setDirty(items => items.filter(i => i !== step));
    setCompleted(done => Array.from(new Set([...done, step])));
    setVisited(v => Array.from(new Set([...v, nextStep])));
    setMaxStep((m) => Math.max(m, nextStep));
    setStep(nextStep);
  }
  function prev() { const previous = Math.max(step - 1, 1); setVisited(v => Array.from(new Set([...v, previous]))); setStep(previous); }
  function finish() { router.push(`/dashboard/sr-packets/${packetId}`); }

  if (loading) return <p role="status">Reopening saved packet…</p>;
  if (loadFailed) return <div role="alert">{error} <Link href="/dashboard/sr-packets">Back to packets</Link></div>;
  const guidance = [
    "Confirm the patient. Start from the incident report to link it automatically. Create one packet for this episode.",
    "Record the actual intervention, reason, start time and order details. Save & Continue stores this section before moving on.",
    "Document the evaluation time, patient response and practitioner. Enter observed findings; do not guess or prefill clinical answers.",
    "Record each observation with its time, behavior, intervention and staff initials. Use N/A only when appropriate.",
    "Document release, total minutes, patient status and RN details.",
    "Document the patient discussion and prevention plan, or record the patient's refusal without inventing responses.",
    "Identify the team leader and document the staff debrief. This section is not for the patient record.",
    "Answer every checklist item honestly (Yes, No or N/A), then review the packet before submitting. This section is not for the patient record.",
  ];

  return (
    <PacketWorkspace step={step} maxStep={maxStep} completed={completed} packetId={packetId}
      patientLabel={patientLabel} guidance={guidance[step]} dirty={dirty}
      onEdit={() => { if (step > 0) setDirty(items => items.includes(step) ? items : [...items, step]); }}
      onNavigate={i => { setVisited(v => Array.from(new Set([...v, i]))); setStep(i); }}>
      {/* Step content */}
      {step === 0 && (
        <div style={{ background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--text)", marginBottom: 4 }}>Confirm patient &amp; episode</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
              The following forms must be completed for ANY seclusion/personal or chemical restraint.
              Ensure to include the incident report associated with the S&amp;R.
            </p>
          </div>
          {incidentId && (
            <div style={{ background: "var(--gold-faint)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", fontSize: "0.875rem", borderRadius: 8, padding: "12px 16px" }}>
              Linked to Incident Report: <strong>{incidentId}</strong>
            </div>
          )}
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>Patient</p>
            <PatientSelector value={patientId} onChange={setPatientId} />
          </div>
          {error && <p role="alert" style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={createPacket}
              disabled={creating}
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                cursor: creating ? "default" : "pointer",
                opacity: creating ? 0.6 : 1,
                fontSize: "0.875rem",
              }}
            >
              {creating ? "Creating…" : "Start Packet →"}
            </button>
          </div>
        </div>
      )}

      {visited.includes(1) && packetId && (
        <div hidden={step !== 1}>
          <PhysicianOrderForm initialValues={initial.physicianOrder} srPacketId={packetId} onNext={next} onBack={prev} />
        </div>
      )}
      {visited.includes(2) && packetId && (
        <div hidden={step !== 2}>
          <FaceToFaceForm initialValues={initial.faceToFaceEval} srPacketId={packetId} onNext={next} onBack={prev} />
        </div>
      )}
      {visited.includes(3) && packetId && (
        <div hidden={step !== 3}>
          <MonitoringLogForm initialValues={initial.monitoringLogs} srPacketId={packetId} onNext={next} onBack={prev} />
        </div>
      )}
      {visited.includes(4) && packetId && (
        <div hidden={step !== 4}>
          <TerminationForm initialValues={initial.terminationSummary} srPacketId={packetId} onNext={next} onBack={prev} />
        </div>
      )}
      {visited.includes(5) && packetId && (
        <div hidden={step !== 5}>
          <PatientDebriefingForm initialValues={initial.patientDebriefing} srPacketId={packetId} onNext={next} onBack={prev} />
        </div>
      )}
      {visited.includes(6) && packetId && (
        <div hidden={step !== 6}>
          <StaffDebriefingForm initialValues={initial.staffDebriefing} srPacketId={packetId} onNext={next} onBack={prev} />
        </div>
      )}
      {visited.includes(7) && packetId && (
        <div hidden={step !== 7}>
          <AfterActionForm initialValues={initial.afterActionCritique} srPacketId={packetId} onNext={finish} onBack={prev} />
        </div>
      )}
    </PacketWorkspace>
  );
}

export default function NewSRPacketPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: "var(--text-3)", textAlign: "center" }}>Loading…</div>}>
      <NewSRPacketContent />
    </Suspense>
  );
}
